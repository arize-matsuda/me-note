import { describe, expect, test } from "vitest";
import { groupMenuExercises } from "./group";

describe("groupMenuExercises", () => {
  test("メニューの順番を保ち、種目を順番どおりにメニューへ入れる", () => {
    const menus = [
      { id: "m1", name: "胸の日" },
      { id: "m2", name: "脚の日" },
    ];
    const items = [
      { menuId: "m2", id: "e3", name: "スクワット" },
      { menuId: "m1", id: "e1", name: "ベンチプレス" },
      { menuId: "m1", id: "e2", name: "ダンベルフライ" },
    ];
    expect(groupMenuExercises(menus, items)).toEqual([
      {
        id: "m1",
        name: "胸の日",
        exercises: [
          { id: "e1", name: "ベンチプレス" },
          { id: "e2", name: "ダンベルフライ" },
        ],
      },
      {
        id: "m2",
        name: "脚の日",
        exercises: [{ id: "e3", name: "スクワット" }],
      },
    ]);
  });

  test("種目のないメニューは空の配列になる", () => {
    expect(groupMenuExercises([{ id: "m1", name: "胸の日" }], [])).toEqual([
      { id: "m1", name: "胸の日", exercises: [] },
    ]);
  });

  test("一覧にないメニューの種目は無視する", () => {
    expect(
      groupMenuExercises(
        [{ id: "m1", name: "胸の日" }],
        [{ menuId: "x", id: "e1", name: "ベンチプレス" }],
      ),
    ).toEqual([{ id: "m1", name: "胸の日", exercises: [] }]);
  });
});
