import { describe, expect, test } from "vitest";
import {
  getMonthGrid,
  getMonthStart,
  parseSelectedDate,
  shiftMonth,
} from "./month";

const TODAY = "2026-11-19";

describe("parseSelectedDate", () => {
  test("正しい日付ならそのまま", () => {
    expect(parseSelectedDate("2026-10-05", TODAY)).toBe("2026-10-05");
  });

  test("未来の日付も選べる", () => {
    expect(parseSelectedDate("2027-01-01", TODAY)).toBe("2027-01-01");
  });

  test.each([
    undefined,
    "",
    "abc",
    "2026-02-30",
    "2026/11/18",
  ])("%j なら今日", (param) => {
    expect(parseSelectedDate(param, TODAY)).toBe(TODAY);
  });

  test("同じ名前が複数あれば最初のものを使う", () => {
    expect(parseSelectedDate(["2026-10-05", "2026-10-06"], TODAY)).toBe(
      "2026-10-05",
    );
  });
});

describe("getMonthStart / shiftMonth", () => {
  test("月の1日", () => {
    expect(getMonthStart("2026-11-19")).toBe("2026-11-01");
  });

  test("前の月・次の月の1日（年をまたぐ）", () => {
    expect(shiftMonth("2026-01-31", -1)).toBe("2025-12-01");
    expect(shiftMonth("2026-12-15", 1)).toBe("2027-01-01");
  });
});

describe("getMonthGrid", () => {
  test("2026年11月は日曜始まりで、1日が日曜なので前の月の日は入らない", () => {
    const grid = getMonthGrid("2026-11-19");
    expect(grid.monthStart).toBe("2026-11-01");
    expect(grid.monthEnd).toBe("2026-11-30");
    expect(grid.weeks[0]).toEqual([
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
    // 30日（月曜）の週は、12月の日（火〜土）で埋める
    expect(grid.weeks.at(-1)).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
      "2026-12-03",
      "2026-12-04",
      "2026-12-05",
    ]);
    expect(grid.weeks).toHaveLength(5);
  });

  test("最初の週は前の月の日で埋める（2026年12月は火曜始まり）", () => {
    const grid = getMonthGrid("2026-12-10");
    expect(grid.weeks[0].slice(0, 3)).toEqual([
      "2026-11-29",
      "2026-11-30",
      "2026-12-01",
    ]);
  });

  test("どの週も7日で、うるう年の2月も正しく終わる", () => {
    const grid = getMonthGrid("2028-02-10");
    expect(grid.monthEnd).toBe("2028-02-29");
    expect(grid.weeks.every((week) => week.length === 7)).toBe(true);
    expect(grid.weeks.flat()).toContain("2028-02-29");
  });
});
