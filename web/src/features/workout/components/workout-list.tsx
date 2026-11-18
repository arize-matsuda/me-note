import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatRecordDate } from "@/shared/lib/date";
import type { WorkoutSet } from "../data";
import { formatSet } from "../format";
import { groupSetsByDay } from "../group";

type Props = {
  /** 直近30日分のセット（新しい日付が先、同じ日の中は入力した順） */
  sets: WorkoutSet[];
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の表示に年を付けるかの判定に使う */
  today: string;
};

/** 直近30日分の記録を、日付ごと・種目ごとに表示する */
export function WorkoutList({ sets, today }: Props) {
  const days = groupSetsByDay(sets);

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
            {days.map((day) => (
              <li key={day.date} className="flex flex-col gap-3 py-3">
                <h3 className="text-sm font-medium">
                  {formatRecordDate(day.date, today)}
                </h3>
                {day.exercises.map((exercise) => (
                  <div
                    key={exercise.exerciseId}
                    className="flex flex-col gap-1"
                  >
                    <p className="text-sm">{exercise.exerciseName}</p>
                    <ol className="flex flex-col gap-0.5 pl-3 text-sm text-muted-foreground tabular-nums">
                      {exercise.sets.map((set, index) => (
                        <li key={set.id}>
                          {index + 1}. {formatSet(set.weight, set.reps)}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
