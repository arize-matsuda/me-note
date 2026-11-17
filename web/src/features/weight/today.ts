const JAPAN_TIME_ZONE = "Asia/Tokyo";

/** グラフに表示する日数（今日を含む） */
export const CHART_DAYS = 30;

/**
 * 日本時間の「今日」を `YYYY-MM-DD` で返す。
 * サーバー（Vercel）は UTC で動くため、タイムゾーンを明示する。
 */
export function getTodayInJapan(now: Date = new Date()): string {
  // en-CA は日付を YYYY-MM-DD の形で出す
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAPAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** `YYYY-MM-DD` の日付に日数を足した日付を `YYYY-MM-DD` で返す（負の数なら前の日付） */
export function addDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** グラフに表示する最初の日付。今日を含めて CHART_DAYS 日分になる */
export function getChartStartDate(today: string): string {
  return addDays(today, -(CHART_DAYS - 1));
}
