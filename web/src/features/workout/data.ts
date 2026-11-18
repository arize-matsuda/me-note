import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { addDays, getTodayInJapan } from "@/shared/lib/date";
import { workoutExercise, workoutSet } from "./schema";

/**
 * 筋トレの種目とセットを読む処理。
 * どの関数も getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーのデータだけを返す。
 * 呼び出す側（ページ）は <Suspense> の中に置く。
 */

/** 一覧に表示する日数（今日を含む） */
export const LIST_DAYS = 30;

/** 画面に渡す種目 */
export type Exercise = { id: string; name: string };

/** 画面に渡すセット。重量が null なら自重 */
export type WorkoutSet = {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  weight: number | null;
  reps: number;
};

/** 種目ごとの前回の重量・回数 */
export type LastSetValues = Record<
  string,
  { weight: number | null; reps: number }
>;

/** 登録した種目（登録した順） */
export async function getExercises(): Promise<Exercise[]> {
  const user = await getCurrentUser();
  return db
    .select({ id: workoutExercise.id, name: workoutExercise.name })
    .from(workoutExercise)
    .where(eq(workoutExercise.userId, user.id))
    .orderBy(asc(workoutExercise.createdAt));
}

/** 直近 LIST_DAYS 日分（今日を含む）のセット。新しい日付が先、同じ日の中は入力した順 */
export async function getRecentWorkoutSets(): Promise<WorkoutSet[]> {
  const user = await getCurrentUser();
  const startDate = addDays(getTodayInJapan(), -(LIST_DAYS - 1));
  return db
    .select({
      id: workoutSet.id,
      date: workoutSet.date,
      exerciseId: workoutSet.exerciseId,
      exerciseName: workoutExercise.name,
      weight: workoutSet.weight,
      reps: workoutSet.reps,
    })
    .from(workoutSet)
    .innerJoin(workoutExercise, eq(workoutSet.exerciseId, workoutExercise.id))
    .where(and(eq(workoutSet.userId, user.id), gte(workoutSet.date, startDate)))
    .orderBy(desc(workoutSet.date), asc(workoutSet.createdAt));
}

/** 種目ごとの前回（いちばん新しい日付の、最後に入力した）セットの重量・回数 */
export async function getLastSetValues(): Promise<LastSetValues> {
  const user = await getCurrentUser();
  const rows = await db
    .selectDistinctOn([workoutSet.exerciseId], {
      exerciseId: workoutSet.exerciseId,
      weight: workoutSet.weight,
      reps: workoutSet.reps,
    })
    .from(workoutSet)
    .where(eq(workoutSet.userId, user.id))
    .orderBy(
      workoutSet.exerciseId,
      desc(workoutSet.date),
      desc(workoutSet.createdAt),
    );
  return Object.fromEntries(
    rows.map((row) => [row.exerciseId, { weight: row.weight, reps: row.reps }]),
  );
}

/**
 * 日付の範囲（start〜end、両端を含む）のセット。古い日付が先、同じ日の中は入力した順。
 * カレンダーなど、ほかの機能から読むために使う。
 */
export async function getWorkoutSetsInRange(
  start: string,
  end: string,
): Promise<WorkoutSet[]> {
  const user = await getCurrentUser();
  return db
    .select({
      id: workoutSet.id,
      date: workoutSet.date,
      exerciseId: workoutSet.exerciseId,
      exerciseName: workoutExercise.name,
      weight: workoutSet.weight,
      reps: workoutSet.reps,
    })
    .from(workoutSet)
    .innerJoin(workoutExercise, eq(workoutSet.exerciseId, workoutExercise.id))
    .where(
      and(
        eq(workoutSet.userId, user.id),
        gte(workoutSet.date, start),
        lte(workoutSet.date, end),
      ),
    )
    .orderBy(asc(workoutSet.date), asc(workoutSet.createdAt));
}
