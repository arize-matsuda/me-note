/** 体重・体脂肪率を小数点以下1桁で表示する（例: 65 → `65.0`） */
export function formatOneDecimal(value: number): string {
  return value.toFixed(1);
}
