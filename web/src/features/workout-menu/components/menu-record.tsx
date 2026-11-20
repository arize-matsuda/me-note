"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import {
  addWorkoutSet,
  type WorkoutActionState,
} from "@/features/workout/actions";
import {
  initialReps,
  initialWeight,
} from "@/features/workout/components/workout-form";
import type {
  Exercise,
  LastSetValues,
  WorkoutSet,
} from "@/features/workout/data";
import { formatSet } from "@/features/workout/format";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { WorkoutMenu } from "../group";

type Props = {
  menu: WorkoutMenu;
  /** 記録する日付（`YYYY-MM-DD`）。記録の欄で選んだもの */
  date: string;
  /** 種目ごとの前回の重量・回数 */
  lastValues: LastSetValues;
  /** 直近30日分のセット。その日のセットを種目ごとに出す */
  sets: WorkoutSet[];
};

/**
 * メニューの種目を順番に並べ、種目ごとにセットを追加できるようにする。
 * メニューを選んだだけでは何も保存しない。「セットを追加」を押したセットだけを保存する。
 */
export function MenuRecord({ menu, date, lastValues, sets }: Props) {
  const daySets = sets.filter((set) => set.date === date);
  return (
    <ol className="flex flex-col divide-y rounded-lg border">
      {menu.exercises.map((exercise, index) => (
        <MenuExerciseRow
          // メニューを切り替えたら、入力欄を前回の値から入れ直す
          key={`${menu.id}-${exercise.id}`}
          number={index + 1}
          exercise={exercise}
          date={date}
          lastValues={lastValues}
          sets={daySets.filter((set) => set.exerciseId === exercise.id)}
        />
      ))}
    </ol>
  );
}

const initialState: WorkoutActionState = {};

function MenuExerciseRow({
  number,
  exercise,
  date,
  lastValues,
  sets,
}: {
  number: number;
  exercise: Exercise;
  date: string;
  lastValues: LastSetValues;
  /** その日のこの種目のセット（入力した順） */
  sets: WorkoutSet[];
}) {
  const [state, formAction, pending] = useActionState(
    addWorkoutSet,
    initialState,
  );
  // 追加のあとも値を残し、もう一度押すだけで同じセットを追加できるようにする
  const [weight, setWeight] = useState(() =>
    initialWeight(lastValues, exercise.id),
  );
  const [reps, setReps] = useState(() => initialReps(lastValues, exercise.id));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", date);
    formData.set("exerciseId", exercise.id);
    formData.set("weight", weight);
    formData.set("reps", reps);
    startTransition(() => formAction(formData));
  }

  const idPrefix = `menu-exercise-${exercise.id}`;

  return (
    <li className="flex flex-col gap-3 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="min-w-0 font-bold break-words">
          <span className="mr-2 text-sm text-muted-foreground tabular-nums">
            {number}
          </span>
          {exercise.name}
        </h3>
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
          {sets.length}セット
        </span>
      </div>
      {sets.length > 0 && (
        <ol
          className="flex flex-wrap gap-x-3 gap-y-1 text-sm tabular-nums"
          aria-label={`${exercise.name}のこの日のセット`}
        >
          {sets.map((set, index) => (
            <li key={set.id}>
              {index + 1}. {formatSet(set.weight, set.reps)}
            </li>
          ))}
        </ol>
      )}
      {/* チェックはサーバーの入力チェックにまとめるため、ブラウザのチェックは使わない */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-weight`}>重量（kg）</FieldLabel>
            <Input
              id={`${idPrefix}-weight`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="自重は空"
              className="h-11"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              aria-invalid={state.errors?.weight !== undefined}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-reps`}>回数</FieldLabel>
            <Input
              id={`${idPrefix}-reps`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="10"
              className="h-11"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              aria-invalid={state.errors?.reps !== undefined}
            />
          </Field>
          <Button type="submit" className="h-11" disabled={pending}>
            {pending ? "追加中…" : "セットを追加"}
          </Button>
        </div>
        <FieldError>{state.errors?.date}</FieldError>
        <FieldError>{state.errors?.exerciseId}</FieldError>
        <FieldError>{state.errors?.weight}</FieldError>
        <FieldError>{state.errors?.reps}</FieldError>
        {state.message && <FieldError>{state.message}</FieldError>}
      </form>
    </li>
  );
}
