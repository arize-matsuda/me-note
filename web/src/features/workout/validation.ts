import { isValidDate } from "@/shared/lib/date";

/** 入力欄の名前。フォームの name と、エラーのキーに使う */
export type WorkoutField = "name" | "date" | "exerciseId" | "weight" | "reps";

/** 項目ごとのエラー文 */
export type WorkoutErrors = Partial<Record<WorkoutField, string>>;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: WorkoutErrors };

/** 重量・回数（更新のときに使う）。重量が null なら自重 */
export type SetValues = { weight: number | null; reps: number };

/** セットを追加するときの値 */
export type SetInput = SetValues & { date: string; exerciseId: string };

export const EXERCISE_NAME_MAX = 50;
export const WEIGHT_MIN = 0;
export const WEIGHT_MAX = 500;
export const REPS_MIN = 1;
export const REPS_MAX = 999;

// 小数点以下は2桁まで（例: 60、61.25）
const TWO_DECIMALS_PATTERN = /^\d+(\.\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 文字列が uuid の形か（記録・種目の ID のチェックに使う） */
export function isUuid(text: string): boolean {
  return UUID_PATTERN.test(text);
}

/** 種目名をチェックする。前後の空白は取り除く */
export function validateExerciseName(raw: string): ValidationResult<string> {
  const name = raw.trim();
  if (name === "") {
    return { ok: false, errors: { name: "種目名を入力してください。" } };
  }
  if (name.length > EXERCISE_NAME_MAX) {
    return {
      ok: false,
      errors: {
        name: `種目名は${EXERCISE_NAME_MAX}文字以内で入力してください。`,
      },
    };
  }
  return { ok: true, value: name };
}

/** 重量・回数をチェックする（更新のとき） */
export function validateSetValues(raw: {
  weight: string;
  reps: string;
}): ValidationResult<SetValues> {
  const errors: WorkoutErrors = {};

  const weightText = raw.weight.trim();
  let weight: number | null = null;
  if (weightText !== "") {
    const value = TWO_DECIMALS_PATTERN.test(weightText)
      ? Number(weightText)
      : Number.NaN;
    if (Number.isNaN(value) || value < WEIGHT_MIN || value > WEIGHT_MAX) {
      errors.weight = `重量は ${WEIGHT_MIN}〜${WEIGHT_MAX} kg（小数点以下2桁まで）で入力してください。自重の種目は空にしてください。`;
    } else {
      weight = value;
    }
  }

  const repsText = raw.reps.trim();
  let reps = 0;
  if (repsText === "") {
    errors.reps = "回数を入力してください。";
  } else {
    const value = INTEGER_PATTERN.test(repsText)
      ? Number(repsText)
      : Number.NaN;
    if (Number.isNaN(value) || value < REPS_MIN || value > REPS_MAX) {
      errors.reps = `回数は ${REPS_MIN}〜${REPS_MAX} 回（整数）で入力してください。`;
    } else {
      reps = value;
    }
  }

  if (errors.weight !== undefined || errors.reps !== undefined) {
    return { ok: false, errors };
  }
  return { ok: true, value: { weight, reps } };
}

/**
 * 日付・種目・重量・回数をチェックする（セットを追加するとき）。
 * today は日本時間の今日（`YYYY-MM-DD`）。これより後の日付は不可。
 */
export function validateSetInput(
  raw: { date: string; exerciseId: string; weight: string; reps: string },
  today: string,
): ValidationResult<SetInput> {
  const errors: WorkoutErrors = {};

  const date = raw.date.trim();
  if (date === "") {
    errors.date = "日付を入力してください。";
  } else if (!isValidDate(date)) {
    errors.date = "日付が正しくありません。";
  } else if (date > today) {
    errors.date = "未来の日付は記録できません。";
  }

  const exerciseId = raw.exerciseId.trim();
  if (!isUuid(exerciseId)) {
    errors.exerciseId = "種目を選んでください。";
  }

  const values = validateSetValues(raw);
  if (!values.ok) {
    Object.assign(errors, values.errors);
  }

  if (Object.keys(errors).length > 0 || !values.ok) {
    return { ok: false, errors };
  }
  return { ok: true, value: { date, exerciseId, ...values.value } };
}
