import { describe, expect, test } from "vitest";
import { resolveSelectedMenuId } from "./selected-menu";

const MENUS = [{ id: "m1" }, { id: "m2" }];

describe("resolveSelectedMenuId", () => {
  test("覚えていたメニューがあれば、その ID を返す", () => {
    expect(resolveSelectedMenuId("m2", MENUS)).toBe("m2");
  });

  test("何も覚えていなければ空（使わない）", () => {
    expect(resolveSelectedMenuId(null, MENUS)).toBe("");
  });

  test("覚えていたメニューが削除されていたら空（使わない）", () => {
    expect(resolveSelectedMenuId("deleted", MENUS)).toBe("");
  });

  test("メニューが1つもなければ空", () => {
    expect(resolveSelectedMenuId("m1", [])).toBe("");
  });
});
