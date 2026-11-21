import { and, asc, eq } from "drizzle-orm";
import { workoutExercise } from "@/features/workout/schema";
import { isUuid } from "@/features/workout/validation";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { groupMenuExercises, type WorkoutMenu } from "./group";
import { workoutMenu, workoutMenuExercise } from "./schema";

/**
 * 筋トレのメニューを読む処理。
 * どの関数も getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーのデータだけを返す。
 * 呼び出す側（ページ）は <Suspense> の中に置く。
 */

export type { WorkoutMenu };

/** 登録したメニュー（作った順） */
export async function getMenus(): Promise<WorkoutMenu[]> {
  const user = await getCurrentUser();
  const [menus, items] = await Promise.all([
    db
      .select({ id: workoutMenu.id, name: workoutMenu.name })
      .from(workoutMenu)
      .where(eq(workoutMenu.userId, user.id))
      .orderBy(asc(workoutMenu.createdAt)),
    db
      .select({
        menuId: workoutMenuExercise.menuId,
        id: workoutExercise.id,
        name: workoutExercise.name,
      })
      .from(workoutMenuExercise)
      .innerJoin(
        workoutExercise,
        eq(workoutMenuExercise.exerciseId, workoutExercise.id),
      )
      .where(eq(workoutMenuExercise.userId, user.id))
      .orderBy(asc(workoutMenuExercise.position)),
  ]);
  return groupMenuExercises(menus, items);
}

/** メニューを1つ読む。見つからない（ほかのユーザーのものを含む）ときは null */
export async function getMenu(id: string): Promise<WorkoutMenu | null> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return null;
  }
  const [menu] = await db
    .select({ id: workoutMenu.id, name: workoutMenu.name })
    .from(workoutMenu)
    .where(and(eq(workoutMenu.id, id), eq(workoutMenu.userId, user.id)));
  if (menu === undefined) {
    return null;
  }
  const exercises = await db
    .select({ id: workoutExercise.id, name: workoutExercise.name })
    .from(workoutMenuExercise)
    .innerJoin(
      workoutExercise,
      eq(workoutMenuExercise.exerciseId, workoutExercise.id),
    )
    .where(
      and(
        eq(workoutMenuExercise.menuId, menu.id),
        eq(workoutMenuExercise.userId, user.id),
      ),
    )
    .orderBy(asc(workoutMenuExercise.position));
  return { ...menu, exercises };
}

/** 種目ごとの、その種目が入っているメニューの名前（メニューを作った順）。種目を削除するときの確認に使う */
export async function getMenuNamesByExercise(): Promise<
  Record<string, string[]>
> {
  const user = await getCurrentUser();
  const rows = await db
    .select({
      exerciseId: workoutMenuExercise.exerciseId,
      menuName: workoutMenu.name,
    })
    .from(workoutMenuExercise)
    .innerJoin(workoutMenu, eq(workoutMenuExercise.menuId, workoutMenu.id))
    .where(eq(workoutMenuExercise.userId, user.id))
    .orderBy(asc(workoutMenu.createdAt));
  const result: Record<string, string[]> = {};
  for (const row of rows) {
    result[row.exerciseId] ??= [];
    result[row.exerciseId].push(row.menuName);
  }
  return result;
}
