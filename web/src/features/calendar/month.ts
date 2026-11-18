import { addDays, isValidDate } from "@/shared/lib/date";

/** カレンダーの1か月分 */
export type MonthGrid = {
  /** 表示している月の1日（`YYYY-MM-01`） */
  monthStart: string;
  /** 表示している月の最終日 */
  monthEnd: string;
  /** 週ごとの日付（日曜から土曜の7日）。最初と最後の週は前後の月の日で埋める */
  weeks: string[][];
};

/**
 * URL の `date`（`YYYY-MM-DD`）から、選んだ日を決める。
 * 無い・形が違う・実在しない日付なら today（日本時間の今日）にする。
 */
export function parseSelectedDate(
  param: string | string[] | undefined,
  today: string,
): string {
  const value = Array.isArray(param) ? param[0] : param;
  return value !== undefined && isValidDate(value) ? value : today;
}

/** その日付が入っている月の1日（`YYYY-MM-01`） */
export function getMonthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

/** 前の月・次の月の1日。offset は -1（前の月）か 1（次の月） */
export function shiftMonth(date: string, offset: number): string {
  const [year, month] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return shifted.toISOString().slice(0, 10);
}

/** 日付の曜日（0 = 日曜 … 6 = 土曜） */
function getWeekday(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** その日付が入っている月の、日曜始まりのマス目を作る */
export function getMonthGrid(date: string): MonthGrid {
  const monthStart = getMonthStart(date);
  const monthEnd = addDays(shiftMonth(monthStart, 1), -1);
  // 月の1日の週の日曜日から、月の最終日の週の土曜日まで
  const gridStart = addDays(monthStart, -getWeekday(monthStart));
  const gridEnd = addDays(monthEnd, 6 - getWeekday(monthEnd));

  const weeks: string[][] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(day, index)));
  }
  return { monthStart, monthEnd, weeks };
}
