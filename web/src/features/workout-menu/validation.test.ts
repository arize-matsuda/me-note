import { describe, expect, test } from "vitest";
import { MENU_NAME_MAX, validateMenuInput } from "./validation";

const BENCH = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const FLY = "7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d";

describe("validateMenuInput", () => {
  test("名前の前後の空白を取り除き、種目の順番をそのまま返す", () => {
    expect(
      validateMenuInput({ name: "  胸の日 ", exerciseIds: [FLY, BENCH] }),
    ).toEqual({
      ok: true,
      value: { name: "胸の日", exerciseIds: [FLY, BENCH] },
    });
  });

  test("名前が空ならエラー", () => {
    expect(validateMenuInput({ name: "  ", exerciseIds: [BENCH] })).toEqual({
      ok: false,
      errors: { name: "メニュー名を入力してください。" },
    });
  });

  test(`名前は${MENU_NAME_MAX}文字まで`, () => {
    expect(
      validateMenuInput({
        name: "あ".repeat(MENU_NAME_MAX),
        exerciseIds: [BENCH],
      }).ok,
    ).toBe(true);
    expect(
      validateMenuInput({
        name: "あ".repeat(MENU_NAME_MAX + 1),
        exerciseIds: [BENCH],
      }),
    ).toEqual({
      ok: false,
      errors: {
        name: `メニュー名は${MENU_NAME_MAX}文字以内で入力してください。`,
      },
    });
  });

  test("種目がないとエラー", () => {
    expect(validateMenuInput({ name: "胸の日", exerciseIds: [] })).toEqual({
      ok: false,
      errors: { exerciseIds: "種目を1つ以上選んでください。" },
    });
  });

  test("種目の ID が正しくないとエラー", () => {
    expect(
      validateMenuInput({ name: "胸の日", exerciseIds: [BENCH, "abc"] }),
    ).toEqual({
      ok: false,
      errors: { exerciseIds: "種目を選び直してください。" },
    });
  });

  test("同じ種目を2回入れるとエラー", () => {
    expect(
      validateMenuInput({ name: "胸の日", exerciseIds: [BENCH, FLY, BENCH] }),
    ).toEqual({
      ok: false,
      errors: { exerciseIds: "同じ種目は1つのメニューに1回だけ入れられます。" },
    });
  });

  test("名前と種目の両方がおかしければ、両方のエラーを返す", () => {
    expect(validateMenuInput({ name: "", exerciseIds: [] })).toEqual({
      ok: false,
      errors: {
        name: "メニュー名を入力してください。",
        exerciseIds: "種目を1つ以上選んでください。",
      },
    });
  });
});
