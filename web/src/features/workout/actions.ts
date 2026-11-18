"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { getTodayInJapan, isValidDate } from "@/shared/lib/date";
import type { Exercise } from "./data";
import { workoutExercise, workoutSet } from "./schema";
import {
  isUuid,
  validateExerciseName,
  validateSetInput,
  validateSetValues,
  type WorkoutErrors,
} from "./validation";

/**
 * 筋トレの種目とセットを書き換える Server Action。
 * どれも getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーのデータだけを書き換える。
 * 画面からは useActionState などで呼び、返ってきた結果（エラー文など）を表示する。
 */

/** Server Action の結果 */
export type WorkoutActionState = {
  /** 保存・更新・削除ができたら true */
  ok?: boolean;
  /** 項目ごとのエラー文 */
  errors?: WorkoutErrors;
  /** 項目に結びつかないエラー文 */
  message?: string;
};

/** 種目を追加したときの結果。追加した種目を返す */
export type CreateExerciseState = WorkoutActionState & { exercise?: Exercise };

const WORKOUT_PAGE = "/workout";
const NOT_FOUND_MESSAGE = "記録が見つかりません。";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** 種目を追加する。同じ名前の種目がすでにあればエラー */
export async function createExercise(
  _previous: CreateExerciseState,
  formData: FormData,
): Promise<CreateExerciseState> {
  const user = await getCurrentUser();
  const result = validateExerciseName(text(formData, "name"));
  if (!result.ok) {
    return { errors: result.errors };
  }

  const [created] = await db
    .insert(workoutExercise)
    .values({ userId: user.id, name: result.value })
    // 同じユーザー・同じ名前があれば追加しない（一意の制約を使う）
    .onConflictDoNothing({
      target: [workoutExercise.userId, workoutExercise.name],
    })
    .returning({ id: workoutExercise.id, name: workoutExercise.name });
  if (created === undefined) {
    return { errors: { name: "同じ名前の種目がすでにあります。" } };
  }

  revalidatePath(WORKOUT_PAGE);
  return { ok: true, exercise: created };
}

/** セットを追加する */
export async function addWorkoutSet(
  _previous: WorkoutActionState,
  formData: FormData,
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  const result = validateSetInput(
    {
      date: text(formData, "date"),
      exerciseId: text(formData, "exerciseId"),
      weight: text(formData, "weight"),
      reps: text(formData, "reps"),
    },
    getTodayInJapan(),
  );
  if (!result.ok) {
    return { errors: result.errors };
  }

  const { date, exerciseId, weight, reps } = result.value;
  // 自分の種目であることを確かめる
  const [exercise] = await db
    .select({ id: workoutExercise.id })
    .from(workoutExercise)
    .where(
      and(
        eq(workoutExercise.id, exerciseId),
        eq(workoutExercise.userId, user.id),
      ),
    );
  if (exercise === undefined) {
    return { errors: { exerciseId: "種目を選んでください。" } };
  }

  await db
    .insert(workoutSet)
    .values({ userId: user.id, exerciseId, date, weight, reps });

  revalidatePath(WORKOUT_PAGE);
  return { ok: true };
}

/** セットの重量・回数を直す。日付と種目は変えない */
export async function updateWorkoutSet(
  id: string,
  _previous: WorkoutActionState,
  formData: FormData,
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }
  const result = validateSetValues({
    weight: text(formData, "weight"),
    reps: text(formData, "reps"),
  });
  if (!result.ok) {
    return { errors: result.errors };
  }

  const updated = await db
    .update(workoutSet)
    .set({ ...result.value, updatedAt: new Date() })
    // 自分のセットだけを対象にする
    .where(and(eq(workoutSet.id, id), eq(workoutSet.userId, user.id)))
    .returning({ id: workoutSet.id });
  if (updated.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidatePath(WORKOUT_PAGE);
  return { ok: true };
}

/** セットを削除する */
export async function deleteWorkoutSet(
  id: string,
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }

  const deleted = await db
    .delete(workoutSet)
    // 自分のセットだけを対象にする
    .where(and(eq(workoutSet.id, id), eq(workoutSet.userId, user.id)))
    .returning({ id: workoutSet.id });
  if (deleted.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidatePath(WORKOUT_PAGE);
  return { ok: true };
}

/** その日のその種目のセットを、まとめて削除する */
export async function deleteExerciseSetsOnDate(
  exerciseId: string,
  date: string,
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  if (!isUuid(exerciseId) || !isValidDate(date)) {
    return { message: NOT_FOUND_MESSAGE };
  }

  const deleted = await db
    .delete(workoutSet)
    // 自分のセットだけを対象にする
    .where(
      and(
        eq(workoutSet.userId, user.id),
        eq(workoutSet.exerciseId, exerciseId),
        eq(workoutSet.date, date),
      ),
    )
    .returning({ id: workoutSet.id });
  if (deleted.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidatePath(WORKOUT_PAGE);
  return { ok: true };
}
