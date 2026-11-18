import { describe, expect, test } from "vitest";
import { addDays, getTodayInJapan, isValidDate } from "./date";

describe("getTodayInJapan", () => {
  test("UTC の 15:00 は、日本時間では翌日の 0:00 になる", () => {
    expect(getTodayInJapan(new Date("2026-11-17T15:00:00Z"))).toBe(
      "2026-11-18",
    );
  });

  test("UTC の 14:59 は、日本時間ではまだ同じ日", () => {
    expect(getTodayInJapan(new Date("2026-11-17T14:59:59Z"))).toBe(
      "2026-11-17",
    );
  });

  test("年をまたぐ", () => {
    expect(getTodayInJapan(new Date("2026-12-31T15:00:00Z"))).toBe(
      "2027-01-01",
    );
  });
});

describe("addDays", () => {
  test("月をまたいで前の日付に戻る", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  test("うるう年の2月29日を数える", () => {
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29");
  });

  test("年をまたいで先の日付に進む", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("isValidDate", () => {
  test.each(["2026-11-18", "2028-02-29"])("%s は正しい", (text) => {
    expect(isValidDate(text)).toBe(true);
  });

  test.each([
    "",
    "2026/11/18",
    "2026-02-30",
    "2026-13-01",
    "abc",
  ])("%s は正しくない", (text) => {
    expect(isValidDate(text)).toBe(false);
  });
});
