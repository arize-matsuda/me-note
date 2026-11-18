"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatRecordDate } from "@/shared/lib/date";
import type { WorkoutSet } from "../data";
import { groupSetsByDay } from "../group";
import { ExerciseSetsHeader } from "./exercise-sets-header";
import { WorkoutSetItem } from "./workout-set-item";

type Props = {
  /** 直近30日分のセット（新しい日付が先、同じ日の中は入力した順） */
  sets: WorkoutSet[];
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の表示に年を付けるかの判定に使う */
  today: string;
};

/**
 * 直近30日分の記録を、日付ごと・種目ごとに表示する。
 * セットをタップするとその行で直せる。種目の見出しから、その日のその種目のセットをまとめて削除できる。
 */
export function WorkoutList({ sets, today }: Props) {
  const days = groupSetsByDay(sets);
  // 編集中のセットの ID。同時に編集できるのは1つだけ
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>直近30日の記録</CardTitle>
      </CardHeader>
      <CardContent>
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            直近30日の記録がありません。
          </p>
        ) : (
          <ul className="divide-y">
            {days.map((day) => {
              const dateLabel = formatRecordDate(day.date, today);
              return (
                <li key={day.date} className="flex flex-col gap-3 py-3">
                  <h3 className="text-sm font-medium">{dateLabel}</h3>
                  {day.exercises.map((exercise) => (
                    <div
                      key={exercise.exerciseId}
                      className="flex flex-col gap-1"
                    >
                      <ExerciseSetsHeader
                        exerciseId={exercise.exerciseId}
                        exerciseName={exercise.exerciseName}
                        date={day.date}
                        dateLabel={dateLabel}
                        setCount={exercise.sets.length}
                      />
                      <ol className="flex flex-col pl-3 text-sm tabular-nums">
                        {exercise.sets.map((set, index) => (
                          <WorkoutSetItem
                            key={set.id}
                            set={set}
                            number={index + 1}
                            editing={set.id === editingId}
                            onEdit={() => setEditingId(set.id)}
                            onClose={() => setEditingId(null)}
                          />
                        ))}
                      </ol>
                    </div>
                  ))}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
