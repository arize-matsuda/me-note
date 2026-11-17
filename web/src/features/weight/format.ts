const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

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

/** 体重・体脂肪率を小数点以下1桁で表示する（例: 65 → `65.0`） */
export function formatOneDecimal(value: number): string {
  return value.toFixed(1);
}
