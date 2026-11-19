const JAPAN_TIME_ZONE = "Asia/Tokyo";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

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

/** `YYYY-MM-DD` の形で、実際にある日付か（2月30日などは不可） */
export function isValidDate(text: string): boolean {
  if (!DATE_PATTERN.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
  );
}

/**
 * 一覧に表示する日付。`2026-11-18` を `11/18（水）` にする。
 * today（`YYYY-MM-DD`）と年が違うときは `2025/11/18（火）` のように年も付ける。
 */
export function formatRecordDate(date: string, today: string): string {
  const [year, month, day] = date.split("-");
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  const monthDay = `${Number(month)}/${Number(day)}（${weekday}）`;
  return year === today.slice(0, 4) ? monthDay : `${year}/${monthDay}`;
}

/** 見出しに出す日付。`2026-11-19` を `2026年11月19日（木）` にする */
export function formatLongDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}
