"use server";

import { and, eq, isNull, max, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { workoutMenuExercise } from "@/features/workout-menu/schema";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { getTodayInJapan, isValidDate } from "@/shared/lib/date";
import type { Exercise } from "./data";
import { workoutExercise, workoutSet } from "./schema";
import {
  isUuid,
  validateExerciseName,
  validateExerciseOrder,
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
const EXERCISE_NOT_FOUND_MESSAGE = "種目が見つかりません。";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** 種目の画面をすべて読み直す */
function revalidateExercisePages() {
  revalidatePath(WORKOUT_PAGE);
  revalidatePath("/workout/menus");
  revalidatePath("/workout/exercises");
}

const DUPLICATE_NAME_MESSAGE = "同じ名前の種目がすでにあります。";
const DUPLICATE_DELETED_NAME_MESSAGE = "同じ名前の種目があります（削除済み）。";

/** そのユーザーの種目の、次の並び順（一番下） */
async function nextPosition(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: max(workoutExercise.position) })
    .from(workoutExercise)
    .where(eq(workoutExercise.userId, userId));
  return (row?.value ?? -1) + 1;
}

/**
 * 種目を追加する。並びの一番下に入れる。
 * 同じ名前の種目がすでにあればエラー。削除した種目と同じ名前なら、その種目を戻す（記録とつながる）。
 */
export async function createExercise(
  _previous: CreateExerciseState,
  formData: FormData,
): Promise<CreateExerciseState> {
  const user = await getCurrentUser();
  const result = validateExerciseName(text(formData, "name"));
  if (!result.ok) {
    return { errors: result.errors };
  }
  const name = result.value;

  const [existing] = await db
    .select({ id: workoutExercise.id, deletedAt: workoutExercise.deletedAt })
    .from(workoutExercise)
    .where(
      and(eq(workoutExercise.userId, user.id), eq(workoutExercise.name, name)),
    );
  if (existing !== undefined && existing.deletedAt === null) {
    return { errors: { name: DUPLICATE_NAME_MESSAGE } };
  }

  const position = await nextPosition(user.id);
  if (existing !== undefined) {
    // 削除した種目を戻す
    const [restored] = await db
      .update(workoutExercise)
      .set({ deletedAt: null, position })
      .where(
        and(
          eq(workoutExercise.id, existing.id),
          eq(workoutExercise.userId, user.id),
        ),
      )
      .returning({ id: workoutExercise.id, name: workoutExercise.name });
    revalidateExercisePages();
    return { ok: true, exercise: restored };
  }

  const [created] = await db
    .insert(workoutExercise)
    .values({ userId: user.id, name, position })
    // 同時に同じ名前で追加されたときは追加しない（一意の制約を使う）
    .onConflictDoNothing({
      target: [workoutExercise.userId, workoutExercise.name],
    })
    .returning({ id: workoutExercise.id, name: workoutExercise.name });
  if (created === undefined) {
    return { errors: { name: DUPLICATE_NAME_MESSAGE } };
  }

  revalidateExercisePages();
  return { ok: true, exercise: created };
}

/**
 * 種目の名前を変える。これまでの記録・メニューにも新しい名前で表示される。
 * ほかの種目（削除した種目を含む）と同じ名前にはできない。
 */
export async function renameExercise(
  id: string,
  _previous: WorkoutActionState,
  formData: FormData,
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: EXERCISE_NOT_FOUND_MESSAGE };
  }
  const result = validateExerciseName(text(formData, "name"));
  if (!result.ok) {
    return { errors: result.errors };
  }
  const name = result.value;

  const [other] = await db
    .select({ deletedAt: workoutExercise.deletedAt })
    .from(workoutExercise)
    .where(
      and(
        eq(workoutExercise.userId, user.id),
        eq(workoutExercise.name, name),
        ne(workoutExercise.id, id),
      ),
    );
  if (other !== undefined) {
    return {
      errors: {
        name:
          other.deletedAt === null
            ? DUPLICATE_NAME_MESSAGE
            : DUPLICATE_DELETED_NAME_MESSAGE,
      },
    };
  }

  let updated: { id: string }[];
  try {
    updated = await db
      .update(workoutExercise)
      .set({ name })
      // 自分の、削除していない種目だけを対象にする
      .where(
        and(
          eq(workoutExercise.id, id),
          eq(workoutExercise.userId, user.id),
          isNull(workoutExercise.deletedAt),
        ),
      )
      .returning({ id: workoutExercise.id });
  } catch {
    // 同時に同じ名前に変えられたときなど（一意の制約）
    return { errors: { name: DUPLICATE_NAME_MESSAGE } };
  }
  if (updated.length === 0) {
    return { message: EXERCISE_NOT_FOUND_MESSAGE };
  }

  revalidateExercisePages();
  return { ok: true };
}

/** 種目の並び順を保存する。ids は新しい並び（上から順）で、削除していない自分の種目をすべて含む */
export async function saveExerciseOrder(
  ids: string[],
): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  const active = await db
    .select({ id: workoutExercise.id })
    .from(workoutExercise)
    .where(
      and(
        eq(workoutExercise.userId, user.id),
        isNull(workoutExercise.deletedAt),
      ),
    );
  const result = validateExerciseOrder(
    ids,
    active.map((row) => row.id),
  );
  if (!result.ok) {
    return { message: result.message };
  }
  if (ids.length === 0) {
    return { ok: true };
  }

  const [first, ...rest] = ids.map((exerciseId, position) =>
    db
      .update(workoutExercise)
      .set({ position })
      .where(
        and(
          eq(workoutExercise.id, exerciseId),
          eq(workoutExercise.userId, user.id),
        ),
      ),
  );
  // すべての種目の並び順を、1回のトランザクションで書き換える
  await db.batch([first, ...rest]);

  revalidateExercisePages();
  return { ok: true };
}

/**
 * 種目を削除する。種目そのものは消さずに削除の印を付け、選択肢に出さなくする。
 * 入っていたメニューからは外す。これまでの記録（セット）は消さない。
 */
export async function deleteExercise(id: string): Promise<WorkoutActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: EXERCISE_NOT_FOUND_MESSAGE };
  }

  const [deleted] = await db.batch([
    db
      .update(workoutExercise)
      .set({ deletedAt: new Date() })
      // 自分の、削除していない種目だけを対象にする
      .where(
        and(
          eq(workoutExercise.id, id),
          eq(workoutExercise.userId, user.id),
          isNull(workoutExercise.deletedAt),
        ),
      )
      .returning({ id: workoutExercise.id }),
    db
      .delete(workoutMenuExercise)
      .where(
        and(
          eq(workoutMenuExercise.exerciseId, id),
          eq(workoutMenuExercise.userId, user.id),
        ),
      ),
  ]);
  if (deleted.length === 0) {
    return { message: EXERCISE_NOT_FOUND_MESSAGE };
  }

  revalidateExercisePages();
  return { ok: true };
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
        isNull(workoutExercise.deletedAt),
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
