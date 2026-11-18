import Link from "next/link";
import type { WeightRecord } from "@/features/weight/data";
import { formatOneDecimal } from "@/features/weight/format";
import type { WorkoutSet } from "@/features/workout/data";
import { formatSet } from "@/features/workout/format";
import { groupSetsByDay } from "@/features/workout/group";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatRecordDate } from "@/shared/lib/date";

type Props = {
  date: string;
  today: string;
  /** その日の体重・体脂肪率の記録（なければ null） */
  weight: WeightRecord | null;
  /** その日の筋トレのセット（入力した順） */
  workoutSets: WorkoutSet[];
};

/** 選んだ日の記録（見るだけ） */
export function DayRecords({ date, today, weight, workoutSets }: Props) {
  const exercises = groupSetsByDay(workoutSets)[0]?.exercises ?? [];
  const isEmpty = weight === null && exercises.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatRecordDate(date, today)}の記録</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {isEmpty && <p className="text-muted-foreground">記録がありません。</p>}
        {weight !== null && (
          <section className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 font-medium">
              <span className="size-2 rounded-full bg-sky-500" aria-hidden />
              体重・体脂肪率
            </h3>
            <p className="pl-4 tabular-nums">
              {formatOneDecimal(weight.weight)} kg
              {weight.bodyFatPercentage !== null &&
                ` / ${formatOneDecimal(weight.bodyFatPercentage)} %`}
            </p>
          </section>
        )}
        {exercises.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-medium">
              <span className="size-2 rounded-full bg-amber-500" aria-hidden />
              筋トレ
            </h3>
            {exercises.map((exercise) => (
              <div
                key={exercise.exerciseId}
                className="flex flex-col gap-0.5 pl-4"
              >
                <p>{exercise.exerciseName}</p>
                <ol className="flex flex-col pl-3 text-muted-foreground tabular-nums">
                  {exercise.sets.map((set, index) => (
                    <li key={set.id}>
                      {index + 1}. {formatSet(set.weight, set.reps)}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/weight"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            体重・体脂肪率へ
          </Link>
          <Link
            href="/workout"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            筋トレへ
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
