import { describe, expect, test } from "vitest";
import { formatSet, formatWeight } from "./format";

describe("formatWeight", () => {
  test.each([
    [60, "60kg"],
    [61.25, "61.25kg"],
    [0, "0kg"],
    [null, "自重"],
  ])("%s は %s", (weight, expected) => {
    expect(formatWeight(weight)).toBe(expected);
  });
});

describe("formatSet", () => {
  test("重量 × 回数", () => {
    expect(formatSet(60, 10)).toBe("60kg × 10回");
  });

  test("重量がなければ自重", () => {
    expect(formatSet(null, 12)).toBe("自重 × 12回");
  });
});
