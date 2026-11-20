"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { workoutExercise } from "@/features/workout/schema";
import { isUuid } from "@/features/workout/validation";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { workoutMenu, workoutMenuExercise } from "./schema";
import { type MenuErrors, validateMenuInput } from "./validation";

/**
 * 筋トレのメニューを書き換える Server Action。
 * どれも getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーのデータだけを書き換える。
 * メニューの種目は、フォームの exerciseId を並んだ順に送る（並び順がそのままメニューの順番になる）。
 */

/** Server Action の結果 */
export type MenuActionState = {
  /** 保存・削除ができたら true */
  ok?: boolean;
  /** 項目ごとのエラー文 */
  errors?: MenuErrors;
  /** 項目に結びつかないエラー文 */
  message?: string;
};

const NOT_FOUND_MESSAGE = "メニューが見つかりません。";
const DUPLICATE_NAME_MESSAGE = "同じ名前のメニューがすでにあります。";
const SAVE_FAILED_MESSAGE =
  "保存できませんでした。時間をおいてもう一度お試しください。";

function readInput(formData: FormData) {
  const name = formData.get("name");
  return {
    name: typeof name === "string" ? name : "",
    exerciseIds: formData
      .getAll("exerciseId")
      .filter((value): value is string => typeof value === "string"),
  };
}

function revalidateMenuPages() {
  revalidatePath("/workout");
  revalidatePath("/workout/menus");
}

/** 種目がすべて、そのユーザーのものか */
async function ownsAllExercises(userId: string, exerciseIds: string[]) {
  const rows = await db
    .select({ id: workoutExercise.id })
    .from(workoutExercise)
    .where(
      and(
        eq(workoutExercise.userId, userId),
        inArray(workoutExercise.id, exerciseIds),
      ),
    );
  return rows.length === exerciseIds.length;
}

/** 同じ名前のメニューがあるか（exceptId のメニューは除く） */
async function nameIsTaken(userId: string, name: string, exceptId?: string) {
  const rows = await db
    .select({ id: workoutMenu.id })
    .from(workoutMenu)
    .where(
      and(
        eq(workoutMenu.userId, userId),
        eq(workoutMenu.name, name),
        exceptId === undefined ? undefined : ne(workoutMenu.id, exceptId),
      ),
    );
  return rows.length > 0;
}

function menuExerciseRows(
  userId: string,
  menuId: string,
  exerciseIds: string[],
) {
  return exerciseIds.map((exerciseId, position) => ({
    userId,
    menuId,
    exerciseId,
    position,
  }));
}

/** メニューを作る */
export async function createMenu(
  _previous: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const user = await getCurrentUser();
  const result = validateMenuInput(readInput(formData));
  if (!result.ok) {
    return { errors: result.errors };
  }
  const { name, exerciseIds } = result.value;

  if (!(await ownsAllExercises(user.id, exerciseIds))) {
    return { errors: { exerciseIds: "種目を選び直してください。" } };
  }
  if (await nameIsTaken(user.id, name)) {
    return { errors: { name: DUPLICATE_NAME_MESSAGE } };
  }

  // メニューと種目を1回のトランザクションで保存する（途中で失敗したら何も残さない）
  const menuId = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(workoutMenu).values({ id: menuId, userId: user.id, name }),
      db
        .insert(workoutMenuExercise)
        .values(menuExerciseRows(user.id, menuId, exerciseIds)),
    ]);
  } catch {
    // 同時に同じ名前で保存されたときなど
    return { message: SAVE_FAILED_MESSAGE };
  }

  revalidateMenuPages();
  return { ok: true };
}

/** メニューの名前と種目の並びを直す。種目は送られた並びで置き換える */
export async function updateMenu(
  id: string,
  _previous: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }
  const result = validateMenuInput(readInput(formData));
  if (!result.ok) {
    return { errors: result.errors };
  }
  const { name, exerciseIds } = result.value;

  const [menu] = await db
    .select({ id: workoutMenu.id })
    .from(workoutMenu)
    // 自分のメニューだけを対象にする
    .where(and(eq(workoutMenu.id, id), eq(workoutMenu.userId, user.id)));
  if (menu === undefined) {
    return { message: NOT_FOUND_MESSAGE };
  }
  if (!(await ownsAllExercises(user.id, exerciseIds))) {
    return { errors: { exerciseIds: "種目を選び直してください。" } };
  }
  if (await nameIsTaken(user.id, name, id)) {
    return { errors: { name: DUPLICATE_NAME_MESSAGE } };
  }

  // 名前の変更と種目の入れ替えを1回のトランザクションで行う
  try {
    await db.batch([
      db
        .update(workoutMenu)
        .set({ name, updatedAt: new Date() })
        .where(and(eq(workoutMenu.id, id), eq(workoutMenu.userId, user.id))),
      db
        .delete(workoutMenuExercise)
        .where(
          and(
            eq(workoutMenuExercise.menuId, id),
            eq(workoutMenuExercise.userId, user.id),
          ),
        ),
      db
        .insert(workoutMenuExercise)
        .values(menuExerciseRows(user.id, id, exerciseIds)),
    ]);
  } catch {
    return { message: SAVE_FAILED_MESSAGE };
  }

  revalidateMenuPages();
  return { ok: true };
}

/** メニューを削除する。筋トレの記録（セット）は消えない */
export async function deleteMenu(id: string): Promise<MenuActionState> {
  const user = await getCurrentUser();
  if (!isUuid(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }

  const deleted = await db
    .delete(workoutMenu)
    // 自分のメニューだけを対象にする。メニューの種目は一緒に消える
    .where(and(eq(workoutMenu.id, id), eq(workoutMenu.userId, user.id)))
    .returning({ id: workoutMenu.id });
  if (deleted.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidateMenuPages();
  return { ok: true };
}
