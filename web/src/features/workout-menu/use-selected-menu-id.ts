"use client";

import { useEffect, useState } from "react";
import {
  readStoredMenuId,
  resolveSelectedMenuId,
  writeStoredMenuId,
} from "./selected-menu";

/**
 * 選んだメニューの ID と、それを変える関数。選んだメニューは端末ごとに覚える。
 * 最初の表示は「使わない」にし、表示のあとで覚えていたメニューに切り替える
 * （サーバーではブラウザに覚えた値を読めず、最初の表示を合わせるため）。
 */
export function useSelectedMenuId(
  menus: { id: string }[],
): [string, (id: string) => void] {
  const [menuId, setMenuId] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: 開いたときに1回だけ読む
  useEffect(() => {
    const stored = readStoredMenuId();
    const resolved = resolveSelectedMenuId(stored, menus);
    if (stored !== null && resolved === "") {
      // 削除されたメニューは忘れる
      writeStoredMenuId("");
    }
    setMenuId(resolved);
  }, []);

  function select(id: string) {
    setMenuId(id);
    writeStoredMenuId(id);
  }

  return [menuId, select];
}
