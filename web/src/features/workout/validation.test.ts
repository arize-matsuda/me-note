import { describe, expect, test } from "vitest";
import {
  validateExerciseName,
  validateExerciseOrder,
  validateSetInput,
  validateSetValues,
} from "./validation";

const TODAY = "2026-11-18";
const EXERCISE_ID = "3f2b1c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";

function input(
  overrides: Partial<{
    date: string;
    exerciseId: string;
    weight: string;
    reps: string;
  }> = {},
) {
  return {
    date: TODAY,
    exerciseId: EXERCISE_ID,
    weight: "60",
    reps: "10",
    ...overrides,
  };
}

describe("validateExerciseName", () => {
  test("前後の空白を取り除いて通る", () => {
    expect(validateExerciseName("  ベンチプレス ")).toEqual({
      ok: true,
      value: "ベンチプレス",
    });
  });

  test.each(["", "   "])("空（%j）はエラー", (name) => {
    expect(validateExerciseName(name)).toEqual({
      ok: false,
      errors: { name: "種目名を入力してください。" },
    });
  });

  test("50文字までは通り、51文字はエラー", () => {
    expect(validateExerciseName("あ".repeat(50)).ok).toBe(true);
    expect(validateExerciseName("あ".repeat(51)).ok).toBe(false);
  });
});

describe("validateSetInput", () => {
  test("正しい入力は数値に変わって通る", () => {
    expect(validateSetInput(input({ weight: "61.25" }), TODAY)).toEqual({
      ok: true,
      value: {
        date: TODAY,
        exerciseId: EXERCISE_ID,
        weight: 61.25,
        reps: 10,
      },
    });
  });

  test("重量が空なら null（自重）で通る", () => {
    const result = validateSetInput(input({ weight: "" }), TODAY);
    expect(result.ok && result.value.weight).toBeNull();
  });

  test("過去の日付は通る", () => {
    expect(validateSetInput(input({ date: "2025-01-01" }), TODAY).ok).toBe(
      true,
    );
  });

  test.each([
    ["空", "", "日付を入力してください。"],
    ["存在しない日付", "2026-02-30", "日付が正しくありません。"],
    ["未来の日付", "2026-11-19", "未来の日付は記録できません。"],
  ])("日付が%sならエラー", (_, date, message) => {
    const result = validateSetInput(input({ date }), TODAY);
    expect(!result.ok && result.errors.date).toBe(message);
  });

  test.each([
    "",
    "abc",
  ])("種目が選ばれていない（%j）ならエラー", (exerciseId) => {
    const result = validateSetInput(input({ exerciseId }), TODAY);
    expect(!result.ok && result.errors.exerciseId).toBe(
      "種目を選んでください。",
    );
  });

  test.each(["0", "500", "1.25", "0.5"])("重量 %s は通る", (weight) => {
    expect(validateSetInput(input({ weight }), TODAY).ok).toBe(true);
  });

  test.each([
    "500.01",
    "1.255",
    "-1",
    "abc",
    "６０",
  ])("重量 %s はエラー", (weight) => {
    const result = validateSetInput(input({ weight }), TODAY);
    expect(!result.ok && result.errors.weight).toBeTruthy();
  });

  test("回数が空ならエラー", () => {
    const result = validateSetInput(input({ reps: "" }), TODAY);
    expect(!result.ok && result.errors.reps).toBe("回数を入力してください。");
  });

  test.each(["1", "999"])("回数 %s は通る", (reps) => {
    expect(validateSetInput(input({ reps }), TODAY).ok).toBe(true);
  });

  test.each(["0", "1000", "10.5", "abc"])("回数 %s はエラー", (reps) => {
    const result = validateSetInput(input({ reps }), TODAY);
    expect(!result.ok && result.errors.reps).toBe(
      "回数は 1〜999 回（整数）で入力してください。",
    );
  });

  test("複数の項目がまちがっていれば、すべてのエラーを返す", () => {
    const result = validateSetInput(
      { date: "", exerciseId: "", weight: "999", reps: "" },
      TODAY,
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(
      ["date", "exerciseId", "reps", "weight"].sort(),
    );
  });
});

describe("validateSetValues", () => {
  test("重量・回数だけをチェックする", () => {
    expect(validateSetValues({ weight: "", reps: "12" })).toEqual({
      ok: true,
      value: { weight: null, reps: 12 },
    });
  });
});

describe("validateExerciseOrder", () => {
  const A = "11111111-1111-4111-8111-111111111111";
  const B = "22222222-2222-4222-8222-222222222222";
  const C = "33333333-3333-4333-8333-333333333333";

  test("今ある種目をちょうど1回ずつ並べ替えたものなら通る", () => {
    expect(validateExerciseOrder([C, A, B], [A, B, C])).toEqual({ ok: true });
  });

  test("足りない種目があるとエラー", () => {
    expect(validateExerciseOrder([A, B], [A, B, C]).ok).toBe(false);
  });

  test("知らない種目（削除した種目やほかの人の種目）があるとエラー", () => {
    expect(validateExerciseOrder([A, B, C], [A, B]).ok).toBe(false);
  });

  test("同じ種目が2回あるとエラー", () => {
    expect(validateExerciseOrder([A, A, B], [A, B, C]).ok).toBe(false);
  });
});
