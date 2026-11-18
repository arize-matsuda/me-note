import { describe, expect, test } from "vitest";
import { isActive } from "./is-active";

describe("isActive", () => {
  test("ホームは / のときだけ", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/weight", "/")).toBe(false);
  });

  test("ほかの項目は、そのページと下のページ", () => {
    expect(isActive("/weight", "/weight")).toBe(true);
    expect(isActive("/weight/123", "/weight")).toBe(true);
  });

  test("名前の先頭が同じだけのページは含まない", () => {
    expect(isActive("/weights", "/weight")).toBe(false);
  });

  test("別のページでは目立たせない", () => {
    expect(isActive("/", "/weight")).toBe(false);
  });
});
