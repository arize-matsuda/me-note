/** 重量を表示する（例: 60 → `60kg`、61.25 → `61.25kg`）。null なら `自重` */
export function formatWeight(weight: number | null): string {
  return weight === null ? "自重" : `${weight}kg`;
}

/** 1セットを表示する（例: `60kg × 10回`、`自重 × 12回`） */
export function formatSet(weight: number | null, reps: number): string {
  return `${formatWeight(weight)} × ${reps}回`;
}
