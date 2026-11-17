/** 入力欄の名前。フォームの name と、エラーのキーに使う */
export type WeightField = "date" | "weight" | "bodyFatPercentage";

/** 入力チェックを通った値 */
export type WeightInput = {
  date: string;
  weight: number;
  bodyFatPercentage: number | null;
};

/** 体重・体脂肪率だけの値（更新のときに使う） */
export type WeightValues = Omit<WeightInput, "date">;

/** 項目ごとのエラー文 */
export type WeightErrors = Partial<Record<WeightField, string>>;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: WeightErrors };

export const WEIGHT_MIN = 20;
export const WEIGHT_MAX = 300;
export const BODY_FAT_MIN = 1;
export const BODY_FAT_MAX = 75;

// 小数点以下は1桁まで（例: 65、65.3）
const ONE_DECIMAL_PATTERN = /^\d+(\.\d)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 文字列を「小数点以下1桁までの数値」として読む。読めなければ null */
function parseOneDecimal(text: string): number | null {
  if (!ONE_DECIMAL_PATTERN.test(text)) {
    return null;
  }
  return Number(text);
}

/** `YYYY-MM-DD` の形で、実際にある日付か（2月30日などは不可） */
function isValidDate(text: string): boolean {
  if (!DATE_PATTERN.test(text)) {
    return false;
  }
  const date = new Date(`${text}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
  );
}

/** 体重をチェックする。エラーなら errors に書いて undefined を返す */
function checkWeight(raw: string, errors: WeightErrors): number | undefined {
  const text = raw.trim();
  if (text === "") {
    errors.weight = "体重を入力してください。";
    return undefined;
  }
  const weight = parseOneDecimal(text);
  if (weight === null || weight < WEIGHT_MIN || weight > WEIGHT_MAX) {
    errors.weight = `体重は ${WEIGHT_MIN}〜${WEIGHT_MAX} kg（小数点以下1桁まで）で入力してください。`;
    return undefined;
  }
  return weight;
}

/** 体脂肪率をチェックする。空なら null。エラーなら errors に書いて undefined を返す */
function checkBodyFat(
  raw: string,
  errors: WeightErrors,
): number | null | undefined {
  const text = raw.trim();
  if (text === "") {
    return null;
  }
  const bodyFat = parseOneDecimal(text);
  if (bodyFat === null || bodyFat < BODY_FAT_MIN || bodyFat > BODY_FAT_MAX) {
    errors.bodyFatPercentage = `体脂肪率は ${BODY_FAT_MIN}〜${BODY_FAT_MAX} %（小数点以下1桁まで）で入力してください。`;
    return undefined;
  }
  return bodyFat;
}

/** 体重・体脂肪率をチェックする（更新のとき） */
export function validateWeightValues(raw: {
  weight: string;
  bodyFatPercentage: string;
}): ValidationResult<WeightValues> {
  const errors: WeightErrors = {};
  const weight = checkWeight(raw.weight, errors);
  const bodyFatPercentage = checkBodyFat(raw.bodyFatPercentage, errors);

  if (weight === undefined || bodyFatPercentage === undefined) {
    return { ok: false, errors };
  }
  return { ok: true, value: { weight, bodyFatPercentage } };
}

/**
 * 日付・体重・体脂肪率をチェックする（保存のとき）。
 * today は日本時間の今日（`YYYY-MM-DD`）。これより後の日付は不可。
 */
export function validateWeightInput(
  raw: { date: string; weight: string; bodyFatPercentage: string },
  today: string,
): ValidationResult<WeightInput> {
  const date = raw.date.trim();
  let dateError: string | undefined;
  if (date === "") {
    dateError = "日付を入力してください。";
  } else if (!isValidDate(date)) {
    dateError = "日付が正しくありません。";
  } else if (date > today) {
    dateError = "未来の日付は記録できません。";
  }

  const values = validateWeightValues(raw);
  if (dateError !== undefined || !values.ok) {
    return {
      ok: false,
      errors: {
        ...(dateError !== undefined && { date: dateError }),
        ...(!values.ok && values.errors),
      },
    };
  }
  return { ok: true, value: { date, ...values.value } };
}
