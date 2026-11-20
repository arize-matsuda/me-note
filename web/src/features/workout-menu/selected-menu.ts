/**
 * /workout で選んだメニューを、端末（ブラウザ）ごとに覚えておくための処理。
 * 覚えるのはメニューの ID だけ。読み書きできないとき（プライベートブラウズなど）は覚えない。
 */

export const SELECTED_MENU_STORAGE_KEY = "me-note:workout-menu-id";

/**
 * 覚えていた ID のうち、今あるメニューのものだけを返す。
 * メニューが削除されていたり、何も覚えていなければ空（「使わない」）。
 */
export function resolveSelectedMenuId(
  storedId: string | null,
  menus: { id: string }[],
): string {
  if (storedId === null) {
    return "";
  }
  return menus.some((menu) => menu.id === storedId) ? storedId : "";
}

export function readStoredMenuId(): string | null {
  try {
    return window.localStorage.getItem(SELECTED_MENU_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredMenuId(id: string): void {
  try {
    if (id === "") {
      window.localStorage.removeItem(SELECTED_MENU_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SELECTED_MENU_STORAGE_KEY, id);
    }
  } catch {
    // 覚えられなくても、選んだメニューでの記録はそのまま使える
  }
}
