import type { WorkoutSet } from "./data";

/** 一覧の1日分 */
export type WorkoutDay = {
  date: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
  }[];
};

/**
 * セットを「日付 → 種目 → セット」にまとめる。
 * 日付は渡された順（新しい日付が先）、種目はその日に最初に入力した順、セットは入力した順に並ぶ。
 * sets は data.ts の getRecentWorkoutSets() の並び（日付の新しい順、同じ日の中は入力した順）を前提にする。
 */
export function groupSetsByDay(sets: WorkoutSet[]): WorkoutDay[] {
  const days: WorkoutDay[] = [];
  for (const set of sets) {
    let day = days.at(-1);
    if (day === undefined || day.date !== set.date) {
      day = { date: set.date, exercises: [] };
      days.push(day);
    }
    let exercise = day.exercises.find((e) => e.exerciseId === set.exerciseId);
    if (exercise === undefined) {
      exercise = {
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        sets: [],
      };
      day.exercises.push(exercise);
    }
    exercise.sets.push(set);
  }
  return days;
}
