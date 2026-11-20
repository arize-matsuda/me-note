import { isUuid } from "@/features/workout/validation";

/** 入力欄の名前。フォームの name と、エラーのキーに使う */
export type MenuField = "name" | "exerciseIds";

/** 項目ごとのエラー文 */
export type MenuErrors = Partial<Record<MenuField, string>>;

export type MenuValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: MenuErrors };

/** メニューを保存するときの値。exerciseIds はメニューの中の順番どおり */
export type MenuInput = { name: string; exerciseIds: string[] };

export const MENU_NAME_MAX = 50;

/**
 * メニュー名と種目の並びをチェックする。名前の前後の空白は取り除く。
 * 種目は1つ以上で、同じ種目は1回だけ。
 */
export function validateMenuInput(raw: {
  name: string;
  exerciseIds: string[];
}): MenuValidationResult<MenuInput> {
  const errors: MenuErrors = {};

  const name = raw.name.trim();
  if (name === "") {
    errors.name = "メニュー名を入力してください。";
  } else if (name.length > MENU_NAME_MAX) {
    errors.name = `メニュー名は${MENU_NAME_MAX}文字以内で入力してください。`;
  }

  const exerciseIds = raw.exerciseIds.map((id) => id.trim());
  if (exerciseIds.length === 0) {
    errors.exerciseIds = "種目を1つ以上選んでください。";
  } else if (!exerciseIds.every(isUuid)) {
    errors.exerciseIds = "種目を選び直してください。";
  } else if (new Set(exerciseIds).size !== exerciseIds.length) {
    errors.exerciseIds = "同じ種目は1つのメニューに1回だけ入れられます。";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { name, exerciseIds } };
}
