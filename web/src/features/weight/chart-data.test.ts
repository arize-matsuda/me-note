import { describe, expect, test } from "vitest";
import { buildChartData } from "./chart-data";
import type { WeightRecord } from "./data";

const TODAY = "2026-11-18";

function record(
  date: string,
  weight: number,
  bodyFatPercentage: number | null = null,
): WeightRecord {
  return { id: date, date, weight, bodyFatPercentage };
}

describe("buildChartData", () => {
  test("今日を含めて30日分を、古い順に並べる", () => {
    const data = buildChartData([], TODAY);
    expect(data).toHaveLength(30);
    expect(data[0].date).toBe("2026-10-20");
    expect(data[29].date).toBe(TODAY);
  });

  test("目盛りは 月/日", () => {
    const data = buildChartData([], TODAY);
    expect(data[0].label).toBe("10/20");
    expect(data[29].label).toBe("11/18");
  });

  test("記録がある日には値が入り、ない日は null", () => {
    const data = buildChartData(
      [record("2026-11-18", 64.8, 18.5), record("2026-11-16", 65.9)],
      TODAY,
    );
    expect(data[29]).toEqual({
      date: "2026-11-18",
      label: "11/18",
      weight: 64.8,
      bodyFatPercentage: 18.5,
    });
    expect(data[28]).toMatchObject({ weight: null, bodyFatPercentage: null });
    expect(data[27]).toMatchObject({ weight: 65.9, bodyFatPercentage: null });
  });

  test("30日より前の記録は入れない", () => {
    const data = buildChartData([record("2026-10-19", 70)], TODAY);
    expect(data.every((point) => point.weight === null)).toBe(true);
  });
});
