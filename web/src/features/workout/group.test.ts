import { describe, expect, test } from "vitest";
import type { WorkoutSet } from "./data";
import { groupSetsByDay } from "./group";

function set(
  id: string,
  date: string,
  exerciseId: string,
  exerciseName: string,
): WorkoutSet {
  return { id, date, exerciseId, exerciseName, weight: 60, reps: 10 };
}

describe("groupSetsByDay", () => {
  test("記録がなければ空", () => {
    expect(groupSetsByDay([])).toEqual([]);
  });

  test("日付ごと・種目ごとにまとめ、入力した順を保つ", () => {
    const days = groupSetsByDay([
      set("1", "2026-11-18", "bench", "ベンチプレス"),
      set("2", "2026-11-18", "squat", "スクワット"),
      set("3", "2026-11-18", "bench", "ベンチプレス"),
      set("4", "2026-11-16", "squat", "スクワット"),
    ]);

    expect(days.map((day) => day.date)).toEqual(["2026-11-18", "2026-11-16"]);
    expect(days[0].exercises.map((e) => e.exerciseName)).toEqual([
      "ベンチプレス",
      "スクワット",
    ]);
    expect(days[0].exercises[0].sets.map((s) => s.id)).toEqual(["1", "3"]);
    expect(days[1].exercises[0].sets.map((s) => s.id)).toEqual(["4"]);
  });
});
