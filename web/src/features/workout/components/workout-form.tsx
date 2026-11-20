"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { addWorkoutSet, type WorkoutActionState } from "../actions";
import type { Exercise, LastSetValues } from "../data";
import { NewExercise } from "./new-exercise";

type Props = {
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の初期値と、選べる日付の上限に使う */
  today: string;
  exercises: Exercise[];
  /** 種目ごとの前回の重量・回数 */
  lastValues: LastSetValues;
};

const initialState: WorkoutActionState = {};

const SELECT_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30";

/** 筋トレのセットを記録するフォーム */
export function WorkoutForm({ today, exercises, lastValues }: Props) {
  const [state, formAction, pending] = useActionState(
    addWorkoutSet,
    initialState,
  );
  // 値を state で持つ（制御された入力）と、追加のあとも値が残り、
  // もう一度「セットを追加」を押すだけで同じセットを繰り返し追加できる
  const [date, setDate] = useState(today);
  const [exerciseId, setExerciseId] = useState(exercises.at(-1)?.id ?? "");
  const [weight, setWeight] = useState(() =>
    initialWeight(lastValues, exercises.at(-1)?.id),
  );
  const [reps, setReps] = useState(() =>
    initialReps(lastValues, exercises.at(-1)?.id),
  );

  // <form action> を使うと、送信のあとに React がフォームを元に戻し、種目の選択が外れてしまう。
  // そのため送信は自分で行い、選んだ種目・重量・回数をそのまま残す
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  // 種目を選んだら、前回その種目でやった重量・回数を入れる
  function selectExercise(id: string) {
    setExerciseId(id);
    setWeight(initialWeight(lastValues, id));
    setReps(initialReps(lastValues, id));
  }

  return (
    <Card className="md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-base font-bold md:text-[17px]">
          記録する
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* チェックはサーバーの入力チェックにまとめるため、ブラウザのチェックは使わない */}
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="workout-date">日付</FieldLabel>
              <Input
                id="workout-date"
                name="date"
                type="date"
                max={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-invalid={state.errors?.date !== undefined}
              />
              <FieldError>{state.errors?.date}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="workout-exercise">種目</FieldLabel>
              <select
                id="workout-exercise"
                name="exerciseId"
                className={SELECT_CLASS}
                value={exerciseId}
                onChange={(event) => selectExercise(event.target.value)}
                aria-invalid={state.errors?.exerciseId !== undefined}
              >
                <option value="">種目を選ぶ</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <FieldError>{state.errors?.exerciseId}</FieldError>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="workout-weight">
                  重量（kg・自重は空）
                </FieldLabel>
                <Input
                  id="workout-weight"
                  name="weight"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="60"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  aria-invalid={state.errors?.weight !== undefined}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="workout-reps">回数</FieldLabel>
                <Input
                  id="workout-reps"
                  name="reps"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="10"
                  value={reps}
                  onChange={(event) => setReps(event.target.value)}
                  aria-invalid={state.errors?.reps !== undefined}
                />
              </Field>
            </div>
            <FieldError>{state.errors?.weight}</FieldError>
            <FieldError>{state.errors?.reps}</FieldError>
            {state.message && <FieldError>{state.message}</FieldError>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "追加中…" : "セットを追加"}
              </Button>
              {state.ok && !pending && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  追加しました（もう一度押すと同じセットを追加します）
                </p>
              )}
            </div>
          </FieldGroup>
        </form>
        <NewExercise onCreated={(exercise) => selectExercise(exercise.id)} />
      </CardContent>
    </Card>
  );
}

function initialWeight(lastValues: LastSetValues, id: string | undefined) {
  const last = id === undefined ? undefined : lastValues[id];
  return last?.weight == null ? "" : String(last.weight);
}

function initialReps(lastValues: LastSetValues, id: string | undefined) {
  const last = id === undefined ? undefined : lastValues[id];
  return last === undefined ? "" : String(last.reps);
}
