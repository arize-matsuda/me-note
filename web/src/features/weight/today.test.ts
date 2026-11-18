import { describe, expect, test } from "vitest";
import { getChartStartDate } from "./today";

describe("getChartStartDate", () => {
  test("今日を含めて30日分になる", () => {
    expect(getChartStartDate("2026-11-18")).toBe("2026-10-20");
  });

  test("年をまたぐ", () => {
    expect(getChartStartDate("2027-01-10")).toBe("2026-12-12");
  });
});
