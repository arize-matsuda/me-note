import { describe, expect, test } from "vitest";
import { formatOneDecimal } from "./format";

describe("formatOneDecimal", () => {
  test.each([
    [65, "65.0"],
    [65.3, "65.3"],
    [100, "100.0"],
  ])("%s は %s", (value, expected) => {
    expect(formatOneDecimal(value)).toBe(expected);
  });
});
