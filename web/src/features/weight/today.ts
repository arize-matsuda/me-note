import { addDays } from "@/shared/lib/date";

/** グラフに表示する日数（今日を含む） */
export const CHART_DAYS = 30;

/** グラフに表示する最初の日付。今日を含めて CHART_DAYS 日分になる */
export function getChartStartDate(today: string): string {
  return addDays(today, -(CHART_DAYS - 1));
}
