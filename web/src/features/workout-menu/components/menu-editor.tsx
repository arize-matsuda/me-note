"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useState,
} from "react";
import { NewExercise } from "@/features/workout/components/new-exercise";
import type { Exercise } from "@/features/workout/data";
import { AppSelect } from "@/shared/components/app-select";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { MenuActionState } from "../actions";
import type { WorkoutMenu } from "../group";

type Props = {
  /** 登録した種目（選択肢に使う） */
  exercises: Exercise[];
  /** 保存の処理（作る・直す） */
  action: (
    previous: MenuActionState,
    formData: FormData,
  ) => Promise<MenuActionState>;
  /** 直すときの、今のメニュー。作るときは省略 */
  menu?: WorkoutMenu;
  submitLabel: string;
  /** 保存できたとき */
  onSaved?: () => void;
  /** 「やめる」を押したとき。省略するとボタンを出さない */
  onCancel?: () => void;
};

/** メニューの名前と種目の並びを入力するフォーム（作る・直すの両方で使う） */
export function MenuEditor({
  exercises,
  action,
  menu,
  submitLabel,
  onSaved,
  onCancel,
}: Props) {
  const [name, setName] = useState(menu?.name ?? "");
  const [selected, setSelected] = useState<Exercise[]>(menu?.exercises ?? []);
  // その場で追加した種目。ページが読み直されるまでの間も選択肢に出す
  const [added, setAdded] = useState<Exercise[]>([]);

  const [state, formAction, pending] = useActionState(
    async (previous: MenuActionState, formData: FormData) => {
      const result = await action(previous, formData);
      if (result.ok) {
        if (menu === undefined) {
          // 作ったあとは、次のメニューを作れるように空にする
          setName("");
          setSelected([]);
        }
        onSaved?.();
      }
      return result;
    },
    {},
  );

  const allExercises = [
    ...exercises,
    ...added.filter((a) => !exercises.some((e) => e.id === a.id)),
  ];
  const choices = allExercises.filter(
    (exercise) => !selected.some((s) => s.id === exercise.id),
  );

  function addExercise(exercise: Exercise) {
    setSelected((current) =>
      current.some((s) => s.id === exercise.id)
        ? current
        : [...current, exercise],
    );
  }

  function move(index: number, offset: -1 | 1) {
    setSelected((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });
  }

  function remove(index: number) {
    setSelected((current) => current.filter((_, i) => i !== index));
  }

  // 種目の並びはフォームの値として送る（exerciseId を並んだ順に）
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    for (const exercise of selected) {
      formData.append("exerciseId", exercise.id);
    }
    startTransition(() => formAction(formData));
  }

  const idPrefix = menu === undefined ? "new-menu" : `menu-${menu.id}`;

  return (
    <div className="flex flex-col gap-6">
      {/* チェックはサーバーの入力チェックにまとめるため、ブラウザのチェックは使わない */}
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-name`}>メニュー名</FieldLabel>
            <Input
              id={`${idPrefix}-name`}
              type="text"
              autoComplete="off"
              placeholder="胸の日"
              className="h-11"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={state.errors?.name !== undefined}
            />
            <FieldError>{state.errors?.name}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-add`}>
              種目（上から順に）
            </FieldLabel>
            {selected.length > 0 ? (
              <ol className="flex flex-col divide-y rounded-lg border">
                {selected.map((exercise, index) => (
                  <li
                    key={exercise.id}
                    className="flex min-h-11 items-center gap-1 pl-3"
                  >
                    <span className="w-6 shrink-0 text-sm text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {exercise.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={`${exercise.name}を上へ`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={`${exercise.name}を下へ`}
                      disabled={index === selected.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11"
                      aria-label={`${exercise.name}を外す`}
                      onClick={() => remove(index)}
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                まだ種目が入っていません。下から選んで足してください。
              </p>
            )}
            <AppSelect
              id={`${idPrefix}-add`}
              options={choices.map((exercise) => ({
                value: exercise.id,
                label: exercise.name,
              }))}
              // 選んだ種目はメニューに足し、プルダウンは「種目を選んで足す」に戻す
              value={null}
              onValueChange={(value) => {
                const exercise = choices.find((e) => e.id === value);
                if (exercise !== undefined) {
                  addExercise(exercise);
                }
              }}
              placeholder={
                choices.length > 0
                  ? "種目を選んで足す"
                  : "足せる種目がありません"
              }
              disabled={choices.length === 0}
              invalid={state.errors?.exerciseIds !== undefined}
            />
            <FieldError>{state.errors?.exerciseIds}</FieldError>
          </Field>
          {state.message && <FieldError>{state.message}</FieldError>}
          <div className="flex items-center gap-3">
            <Button type="submit" className="h-11 px-5" disabled={pending}>
              {pending ? "保存中…" : submitLabel}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={onCancel}
                disabled={pending}
              >
                やめる
              </Button>
            )}
            {menu === undefined && state.ok && !pending && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                保存しました
              </p>
            )}
          </div>
        </FieldGroup>
      </form>
      <NewExercise
        onCreated={(exercise) => {
          setAdded((current) => [...current, exercise]);
          addExercise(exercise);
        }}
      />
    </div>
  );
}
