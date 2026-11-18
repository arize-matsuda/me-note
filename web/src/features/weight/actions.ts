"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { getTodayInJapan } from "@/shared/lib/date";
import { weightRecord } from "./schema";
import {
  validateWeightInput,
  validateWeightValues,
  type WeightErrors,
} from "./validation";

/**
 * 体重・体脂肪率の記録を書き換える Server Action。
 * どれも getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーの記録だけを書き換える。
 * 画面からは useActionState で呼び、返ってきた結果（エラー文など）を表示する。
 */

/** Server Action の結果 */
export type WeightActionState = {
  /** 保存・更新・削除ができたら true */
  ok?: boolean;
  /** 項目ごとのエラー文 */
  errors?: WeightErrors;
  /** 項目に結びつかないエラー文 */
  message?: string;
};

const WEIGHT_PAGE = "/weight";
const NOT_FOUND_MESSAGE = "記録が見つかりません。";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** 記録を保存する。同じ日付の記録がすでにあれば上書きする */
export async function saveWeightRecord(
  _previous: WeightActionState,
  formData: FormData,
): Promise<WeightActionState> {
  const user = await getCurrentUser();
  const result = validateWeightInput(
    {
      date: text(formData, "date"),
      weight: text(formData, "weight"),
      bodyFatPercentage: text(formData, "bodyFatPercentage"),
    },
    getTodayInJapan(),
  );
  if (!result.ok) {
    return { errors: result.errors };
  }

  const { date, weight, bodyFatPercentage } = result.value;
  await db
    .insert(weightRecord)
    .values({ userId: user.id, date, weight, bodyFatPercentage })
    // 同じユーザー・同じ日付があれば、体重・体脂肪率を上書きする（一意の制約を使う）
    .onConflictDoUpdate({
      target: [weightRecord.userId, weightRecord.date],
      set: { weight, bodyFatPercentage, updatedAt: new Date() },
    });

  revalidatePath(WEIGHT_PAGE);
  return { ok: true };
}

/** 記録の体重・体脂肪率を直す。日付は変えない */
export async function updateWeightRecord(
  id: string,
  _previous: WeightActionState,
  formData: FormData,
): Promise<WeightActionState> {
  const user = await getCurrentUser();
  if (!UUID_PATTERN.test(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }
  const result = validateWeightValues({
    weight: text(formData, "weight"),
    bodyFatPercentage: text(formData, "bodyFatPercentage"),
  });
  if (!result.ok) {
    return { errors: result.errors };
  }

  const updated = await db
    .update(weightRecord)
    .set({ ...result.value, updatedAt: new Date() })
    // 自分の記録だけを対象にする
    .where(and(eq(weightRecord.id, id), eq(weightRecord.userId, user.id)))
    .returning({ id: weightRecord.id });
  if (updated.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidatePath(WEIGHT_PAGE);
  return { ok: true };
}

/** 記録を削除する */
export async function deleteWeightRecord(
  id: string,
): Promise<WeightActionState> {
  const user = await getCurrentUser();
  if (!UUID_PATTERN.test(id)) {
    return { message: NOT_FOUND_MESSAGE };
  }

  const deleted = await db
    .delete(weightRecord)
    // 自分の記録だけを対象にする
    .where(and(eq(weightRecord.id, id), eq(weightRecord.userId, user.id)))
    .returning({ id: weightRecord.id });
  if (deleted.length === 0) {
    return { message: NOT_FOUND_MESSAGE };
  }

  revalidatePath(WEIGHT_PAGE);
  return { ok: true };
}
