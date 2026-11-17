import { describe, expect, test } from "vitest";
import { formatOneDecimal, formatRecordDate } from "./format";

describe("formatRecordDate", () => {
  test("今年の日付は月/日（曜日）", () => {
    expect(formatRecordDate("2026-11-18", "2026-11-18")).toBe("11/18（水）");
  });

  test("月・日の先頭の 0 は付けない", () => {
    expect(formatRecordDate("2026-01-05", "2026-11-18")).toBe("1/5（月）");
  });

  test("今年と違う年の日付は年も付ける", () => {
    expect(formatRecordDate("2025-11-18", "2026-11-18")).toBe(
      "2025/11/18（火）",
    );
  });
});

describe("formatOneDecimal", () => {
  test.each([
    [65, "65.0"],
    [65.3, "65.3"],
    [100, "100.0"],
  ])("%s は %s", (value, expected) => {
    expect(formatOneDecimal(value)).toBe(expected);
  });
});
