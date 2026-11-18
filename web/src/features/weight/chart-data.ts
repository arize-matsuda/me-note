import type { WeightRecord } from "./data";
import { addDays, CHART_DAYS, getChartStartDate } from "./today";

/** グラフの1日分。記録がない日は値が null（点を打たない） */
export type ChartPoint = {
  /** `YYYY-MM-DD` */
  date: string;
  /** 横軸の目盛り（例: `11/18`） */
  label: string;
  weight: number | null;
  bodyFatPercentage: number | null;
};

/**
 * 直近30日（今日を含む）の記録を、1日1件のグラフ用データにする。
 * 記録がない日も並べるので、横軸の日付の間隔が正しくなる。
 */
export function buildChartData(
  records: WeightRecord[],
  today: string,
): ChartPoint[] {
  const byDate = new Map(records.map((record) => [record.date, record]));
  const startDate = getChartStartDate(today);

  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const date = addDays(startDate, index);
    const record = byDate.get(date);
    const [, month, day] = date.split("-");
    return {
      date,
      label: `${Number(month)}/${Number(day)}`,
      weight: record?.weight ?? null,
      bodyFatPercentage: record?.bodyFatPercentage ?? null,
    };
  });
}
