"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import { MenuRecord } from "@/features/workout-menu/components/menu-record";
import type { WorkoutMenu } from "@/features/workout-menu/group";
import { useSelectedMenuId } from "@/features/workout-menu/use-selected-menu-id";
import { AppSelect } from "@/shared/components/app-select";
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
import type { Exercise, LastSetValues, WorkoutSet } from "../data";
import { NewExercise } from "./new-exercise";

type Props = {
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の初期値と、選べる日付の上限に使う */
  today: string;
  exercises: Exercise[];
  /** 種目ごとの前回の重量・回数 */
  lastValues: LastSetValues;
  /** 登録したメニュー。選ぶと、メニューの種目が順番に並ぶ */
  menus: WorkoutMenu[];
  /** 直近30日分のセット。メニューの種目ごとに、その日のセットを出すのに使う */
  sets: WorkoutSet[];
};

const SET_FORM_ID = "workout-set-form";

const initialState: WorkoutActionState = {};

/** メニューの「使わない」の value */
const NO_MENU = "none";

/** 筋トレのセットを記録するフォーム */
export function WorkoutForm({
  today,
  exercises,
  lastValues,
  menus,
  sets,
}: Props) {
  const [state, formAction, pending] = useActionState(
    addWorkoutSet,
    initialState,
  );
  // 値を state で持つ（制御された入力）と、追加のあとも値が残り、
  // もう一度「セットを追加」を押すだけで同じセットを繰り返し追加できる
  const [date, setDate] = useState(today);
  const [menuId, setMenuId] = useSelectedMenuId(menus);
  const menu = menus.find((m) => m.id === menuId);
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
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="workout-date">日付</FieldLabel>
            {/* 日付は、種目を1つずつ選ぶフォームと、メニューの各種目の追加の両方で使う */}
            <Input
              id="workout-date"
              name="date"
              form={SET_FORM_ID}
              type="date"
              max={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={
                menu === undefined && state.errors?.date !== undefined
              }
            />
            {menu === undefined && (
              <FieldError>{state.errors?.date}</FieldError>
            )}
          </Field>
          {menus.length > 0 && (
            <Field>
              <FieldLabel htmlFor="workout-menu">メニュー</FieldLabel>
              <AppSelect
                id="workout-menu"
                options={[
                  { value: NO_MENU, label: "使わない" },
                  ...menus.map((m) => ({ value: m.id, label: m.name })),
                ]}
                value={menu?.id ?? NO_MENU}
                onValueChange={(value) =>
                  setMenuId(value === NO_MENU ? "" : value)
                }
              />
            </Field>
          )}
        </FieldGroup>
        {menu !== undefined ? (
          <MenuRecord
            menu={menu}
            date={date}
            lastValues={lastValues}
            sets={sets}
          />
        ) : (
          <>
            <form id={SET_FORM_ID} onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workout-exercise">種目</FieldLabel>
                  <AppSelect
                    id="workout-exercise"
                    name="exerciseId"
                    options={exercises.map((exercise) => ({
                      value: exercise.id,
                      label: exercise.name,
                    }))}
                    value={exerciseId === "" ? null : exerciseId}
                    onValueChange={selectExercise}
                    placeholder="種目を選ぶ"
                    invalid={state.errors?.exerciseId !== undefined}
                  />
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
                    <p
                      className="text-sm text-muted-foreground"
                      aria-live="polite"
                    >
                      追加しました（もう一度押すと同じセットを追加します）
                    </p>
                  )}
                </div>
              </FieldGroup>
            </form>
            <NewExercise
              onCreated={(exercise) => selectExercise(exercise.id)}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** 前回のその種目の重量（入力欄の最初の値）。自重や記録がなければ空 */
export function initialWeight(
  lastValues: LastSetValues,
  id: string | undefined,
) {
  const last = id === undefined ? undefined : lastValues[id];
  return last?.weight == null ? "" : String(last.weight);
}

/** 前回のその種目の回数（入力欄の最初の値）。記録がなければ空 */
export function initialReps(lastValues: LastSetValues, id: string | undefined) {
  const last = id === undefined ? undefined : lastValues[id];
  return last === undefined ? "" : String(last.reps);
}
