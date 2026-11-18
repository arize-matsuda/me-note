import { and, asc, desc, eq, gte } from "drizzle-orm";
import { getCurrentUser } from "@/shared/auth/session";
import { db } from "@/shared/db";
import { getTodayInJapan } from "@/shared/lib/date";
import { weightRecord } from "./schema";
import { getChartStartDate } from "./today";

/**
 * 体重・体脂肪率の記録を読む処理。
 * どの関数も getCurrentUser() でログイン中のユーザーを確かめ、そのユーザーの記録だけを返す。
 * 呼び出す側（ページ）は <Suspense> の中に置く。
 */

/** 画面に渡す記録。ユーザー ID などは含めない */
export type WeightRecord = {
  id: string;
  date: string;
  weight: number;
  bodyFatPercentage: number | null;
};

/** 一覧に表示する件数 */
export const LIST_LIMIT = 30;

const columns = {
  id: weightRecord.id,
  date: weightRecord.date,
  weight: weightRecord.weight,
  bodyFatPercentage: weightRecord.bodyFatPercentage,
};

/** 新しい順に LIST_LIMIT 件 */
export async function getRecentWeightRecords(): Promise<WeightRecord[]> {
  const user = await getCurrentUser();
  return db
    .select(columns)
    .from(weightRecord)
    .where(eq(weightRecord.userId, user.id))
    .orderBy(desc(weightRecord.date))
    .limit(LIST_LIMIT);
}

/** グラフ用。今日（日本時間）を含めて直近30日分を、古い順に */
export async function getWeightRecordsForChart(): Promise<WeightRecord[]> {
  const user = await getCurrentUser();
  const startDate = getChartStartDate(getTodayInJapan());
  return db
    .select(columns)
    .from(weightRecord)
    .where(
      and(eq(weightRecord.userId, user.id), gte(weightRecord.date, startDate)),
    )
    .orderBy(asc(weightRecord.date));
}

/** 前回（いちばん新しい日付）の記録。まだなければ null */
export async function getLatestWeightRecord(): Promise<WeightRecord | null> {
  const user = await getCurrentUser();
  const [latest] = await db
    .select(columns)
    .from(weightRecord)
    .where(eq(weightRecord.userId, user.id))
    .orderBy(desc(weightRecord.date))
    .limit(1);
  return latest ?? null;
}
