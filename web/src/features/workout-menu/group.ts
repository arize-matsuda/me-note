import type { Exercise } from "@/features/workout/data";

/** 画面に渡すメニュー。exercises はメニューの中の順番どおり */
export type WorkoutMenu = { id: string; name: string; exercises: Exercise[] };

/**
 * メニューと、メニューの種目（順番どおりに並んだもの）を組み合わせる。
 * menus の順番を保つ。
 */
export function groupMenuExercises(
  menus: { id: string; name: string }[],
  items: { menuId: string; id: string; name: string }[],
): WorkoutMenu[] {
  const byMenu = new Map<string, Exercise[]>(
    menus.map((menu) => [menu.id, []]),
  );
  for (const item of items) {
    byMenu.get(item.menuId)?.push({ id: item.id, name: item.name });
  }
  return menus.map((menu) => ({
    ...menu,
    exercises: byMenu.get(menu.id) ?? [],
  }));
}
