import { describe, expect, test } from "vitest";
import { validateWeightInput, validateWeightValues } from "./validation";

const TODAY = "2026-11-18";

function input(
  overrides: Partial<{
    date: string;
    weight: string;
    bodyFatPercentage: string;
  }> = {},
) {
  return {
    date: TODAY,
    weight: "65.3",
    bodyFatPercentage: "18.5",
    ...overrides,
  };
}

describe("validateWeightInput", () => {
  test("正しい入力は数値に変わって通る", () => {
    expect(validateWeightInput(input(), TODAY)).toEqual({
      ok: true,
      value: { date: TODAY, weight: 65.3, bodyFatPercentage: 18.5 },
    });
  });

  test("体脂肪率が空なら null で通る", () => {
    expect(
      validateWeightInput(input({ bodyFatPercentage: "" }), TODAY),
    ).toEqual({
      ok: true,
      value: { date: TODAY, weight: 65.3, bodyFatPercentage: null },
    });
  });

  test("整数や前後の空白も受け付ける", () => {
    expect(
      validateWeightInput(
        input({ weight: " 65 ", bodyFatPercentage: "18" }),
        TODAY,
      ),
    ).toEqual({
      ok: true,
      value: { date: TODAY, weight: 65, bodyFatPercentage: 18 },
    });
  });

  test("過去の日付は通る", () => {
    expect(validateWeightInput(input({ date: "2020-01-01" }), TODAY).ok).toBe(
      true,
    );
  });

  test.each([
    ["空", "", "日付を入力してください。"],
    ["形が違う", "2026/11/18", "日付が正しくありません。"],
    ["存在しない日付", "2026-02-30", "日付が正しくありません。"],
    ["未来の日付", "2026-11-19", "未来の日付は記録できません。"],
  ])("日付が%sならエラー", (_, date, message) => {
    expect(validateWeightInput(input({ date }), TODAY)).toEqual({
      ok: false,
      errors: { date: message },
    });
  });

  test("体重が空ならエラー", () => {
    expect(validateWeightInput(input({ weight: "" }), TODAY)).toEqual({
      ok: false,
      errors: { weight: "体重を入力してください。" },
    });
  });

  test.each(["20", "300"])("体重 %s（範囲の端）は通る", (weight) => {
    expect(validateWeightInput(input({ weight }), TODAY).ok).toBe(true);
  });

  test.each([
    "19.9",
    "300.1",
    "65.35",
    "abc",
    "-65",
    "６５",
  ])("体重 %s はエラー", (weight) => {
    const result = validateWeightInput(input({ weight }), TODAY);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.weight).toBe(
      "体重は 20〜300 kg（小数点以下1桁まで）で入力してください。",
    );
  });

  test.each([
    "1",
    "75",
  ])("体脂肪率 %s（範囲の端）は通る", (bodyFatPercentage) => {
    expect(validateWeightInput(input({ bodyFatPercentage }), TODAY).ok).toBe(
      true,
    );
  });

  test.each([
    "0.9",
    "75.1",
    "18.55",
    "abc",
  ])("体脂肪率 %s はエラー", (bodyFatPercentage) => {
    const result = validateWeightInput(input({ bodyFatPercentage }), TODAY);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors.bodyFatPercentage).toBe(
      "体脂肪率は 1〜75 %（小数点以下1桁まで）で入力してください。",
    );
  });

  test("複数の項目がまちがっていれば、すべてのエラーを返す", () => {
    const result = validateWeightInput(
      { date: "", weight: "", bodyFatPercentage: "100" },
      TODAY,
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        date: "日付を入力してください。",
        weight: "体重を入力してください。",
        bodyFatPercentage:
          "体脂肪率は 1〜75 %（小数点以下1桁まで）で入力してください。",
      },
    });
  });
});

describe("validateWeightValues", () => {
  test("日付なしで体重・体脂肪率だけをチェックする", () => {
    expect(
      validateWeightValues({ weight: "70.0", bodyFatPercentage: "" }),
    ).toEqual({ ok: true, value: { weight: 70, bodyFatPercentage: null } });
  });

  test("体重が範囲外ならエラー", () => {
    expect(
      validateWeightValues({ weight: "10", bodyFatPercentage: "" }).ok,
    ).toBe(false);
  });
});
