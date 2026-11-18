import { describe, expect, test } from "vitest";
import type { WeightRecord } from "@/features/weight/data";
import {
  buildDashboardChartData,
  countWorkoutDays,
  formatWeightChange,
  getComparisonDate,
  getWeekStart,
  getWeightChange,
} from "./summary";

function weight(date: string, value: number): WeightRecord {
  return { id: date, date, weight: value, bodyFatPercentage: null };
}

describe("getComparisonDate", () => {
  test("最新の記録の日付から数える（月をまたぐ）", () => {
    expect(getComparisonDate("2026-11-19", 7)).toBe("2026-11-12");
    expect(getComparisonDate("2026-11-19", 30)).toBe("2026-10-20");
  });
});

describe("getWeightChange", () => {
  test("最新 − 比べる記録を、小数点以下1桁に丸める", () => {
    expect(
      getWeightChange(weight("2026-11-19", 64.8), weight("2026-11-12", 65.2)),
    ).toBe(-0.4);
    expect(
      getWeightChange(weight("2026-11-19", 65.3), weight("2026-11-12", 64.8)),
    ).toBe(0.5);
  });

  test("比べる記録がなければ null", () => {
    expect(getWeightChange(weight("2026-11-19", 64.8), null)).toBeNull();
  });
});

describe("formatWeightChange", () => {
  test.each([
    [-0.4, "−0.4 kg"],
    [0.5, "+0.5 kg"],
    [0, "±0.0 kg"],
    [-1, "−1.0 kg"],
  ])("%s は %s", (change, expected) => {
    expect(formatWeightChange(change)).toBe(expected);
  });
});

describe("getWeekStart", () => {
  test("日曜始まり（2026-11-19 は木曜なので 11-15）", () => {
    expect(getWeekStart("2026-11-19")).toBe("2026-11-15");
  });

  test("日曜はその日が週の始まり", () => {
    expect(getWeekStart("2026-11-15")).toBe("2026-11-15");
  });
});

describe("countWorkoutDays", () => {
  test("今週・今月の日数を数え、同じ日は1日と数える", () => {
    const dates = [
      "2026-11-19",
      "2026-11-19",
      "2026-11-15",
      "2026-11-14", // 先週の土曜（今月）
      "2026-10-31", // 先月
    ];
    expect(countWorkoutDays(dates, "2026-11-19")).toEqual({
      week: 2,
      month: 3,
    });
  });

  test("月の初めで週が前の月にまたがるとき、今週は前の月の日も数える", () => {
    // 2026-12-01 は火曜。今週は 11-29（日）から
    expect(
      countWorkoutDays(["2026-11-30", "2026-12-01"], "2026-12-01"),
    ).toEqual({ week: 2, month: 1 });
  });

  test("記録がなければ 0", () => {
    expect(countWorkoutDays([], "2026-11-19")).toEqual({ week: 0, month: 0 });
  });
});

describe("buildDashboardChartData", () => {
  test("直近30日の体重に、筋トレをした日の印を重ねる", () => {
    const data = buildDashboardChartData(
      [weight("2026-11-19", 64.8)],
      ["2026-11-18", "2026-11-18"],
      "2026-11-19",
    );
    expect(data).toHaveLength(30);
    expect(data[29]).toMatchObject({
      date: "2026-11-19",
      weight: 64.8,
      workout: false,
    });
    expect(data[28]).toMatchObject({
      date: "2026-11-18",
      weight: null,
      workout: true,
    });
  });
});
