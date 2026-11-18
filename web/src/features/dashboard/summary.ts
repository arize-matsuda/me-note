import { buildChartData, type ChartPoint } from "@/features/weight/chart-data";
import type { WeightRecord } from "@/features/weight/data";
import { addDays } from "@/shared/lib/date";

/** 体重を比べる日数（最新の記録の日付から数える） */
export const COMPARISON_DAYS = [7, 30] as const;

/** 最新の記録の日付から days 日前の日付。この日か、それより前でいちばん近い記録と比べる */
export function getComparisonDate(latestDate: string, days: number): string {
  return addDays(latestDate, -days);
}

/** 体重の増減（最新 − 比べる記録）。比べる記録がなければ null。小数点以下1桁に丸める */
export function getWeightChange(
  latest: WeightRecord,
  base: WeightRecord | null,
): number | null {
  if (base === null) {
    return null;
  }
  return Math.round((latest.weight - base.weight) * 10) / 10;
}

/** 増減を表示する（例: `+0.4 kg`、`−0.4 kg`、`±0.0 kg`） */
export function formatWeightChange(change: number): string {
  if (change === 0) {
    return "±0.0 kg";
  }
  const sign = change > 0 ? "+" : "−";
  return `${sign}${Math.abs(change).toFixed(1)} kg`;
}

/** 日付の曜日（0 = 日曜 … 6 = 土曜） */
function getWeekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** 今週（日曜始まり）の最初の日 */
export function getWeekStart(today: string): string {
  return addDays(today, -getWeekday(today));
}

/** 今月の最初の日 */
export function getMonthStart(today: string): string {
  return `${today.slice(0, 7)}-01`;
}

/**
 * 今週（日曜始まり）・今月に筋トレをした日数。
 * workoutDates は筋トレをした日（同じ日が何度出てきても1日と数える）。今日より後の日は数えない。
 */
export function countWorkoutDays(
  workoutDates: string[],
  today: string,
): { week: number; month: number } {
  const days = new Set(workoutDates.filter((date) => date <= today));
  const weekStart = getWeekStart(today);
  const monthStart = getMonthStart(today);
  let week = 0;
  let month = 0;
  for (const date of days) {
    if (date >= weekStart) {
      week += 1;
    }
    if (date >= monthStart) {
      month += 1;
    }
  }
  return { week, month };
}

/** グラフの1日分。体重（記録がなければ null）と、その日に筋トレをしたか */
export type DashboardChartPoint = ChartPoint & { workout: boolean };

/** 直近30日の体重のグラフに、筋トレをした日を重ねたデータ */
export function buildDashboardChartData(
  weightRecords: WeightRecord[],
  workoutDates: string[],
  today: string,
): DashboardChartPoint[] {
  const workoutDays = new Set(workoutDates);
  return buildChartData(weightRecords, today).map((point) => ({
    ...point,
    workout: workoutDays.has(point.date),
  }));
}
