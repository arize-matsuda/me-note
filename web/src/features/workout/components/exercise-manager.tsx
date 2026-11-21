"use client";

import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { deleteExercise, renameExercise, saveExerciseOrder } from "../actions";
import type { Exercise } from "../data";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

type Props = {
  /** 削除していない種目（並び順どおり） */
  exercises: Exercise[];
  /** 種目ごとの、その種目が入っているメニューの名前 */
  menuNamesByExercise: Record<string, string[]>;
};

/** 登録した種目の一覧。名前を変える・並べ替える・削除する */
export function ExerciseManager({ exercises, menuNamesByExercise }: Props) {
  // 並べ替えは画面にすぐ反映し、保存できなかったら元に戻す
  const [order, setOrder] = useState<Exercise[] | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // 名前を直している種目の ID。同時に直せるのは1つだけ
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = order ?? exercises;

  function move(index: number, offset: -1 | 1) {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    setOrder(next);
    setOrderError(null);
    startTransition(async () => {
      const result = await saveExerciseOrder(next.map((e) => e.id));
      if (!result.ok) {
        setOrderError(result.message ?? "並べ替えられませんでした。");
      }
      // 保存のあとは、サーバーから読み直した並びを使う
      setOrder(null);
    });
  }

  return (
    <Card className="md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-base font-bold md:text-[17px]">
          登録した種目
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ種目がありません。種目は、筋トレの記録の欄やメニューの管理で追加できます。
          </p>
        ) : (
          <ol className="flex flex-col divide-y">
            {list.map((exercise, index) =>
              exercise.id === editingId ? (
                <RenameRow
                  key={exercise.id}
                  exercise={exercise}
                  onClose={() => setEditingId(null)}
                />
              ) : (
                <ExerciseRow
                  key={exercise.id}
                  number={index + 1}
                  exercise={exercise}
                  menuNames={menuNamesByExercise[exercise.id] ?? []}
                  isFirst={index === 0}
                  isLast={index === list.length - 1}
                  disabled={pending}
                  onMoveUp={() => move(index, -1)}
                  onMoveDown={() => move(index, 1)}
                  onEdit={() => setEditingId(exercise.id)}
                />
              ),
            )}
          </ol>
        )}
        {orderError && <FieldError>{orderError}</FieldError>}
      </CardContent>
    </Card>
  );
}

function ExerciseRow({
  number,
  exercise,
  menuNames,
  isFirst,
  isLast,
  disabled,
  onMoveUp,
  onMoveDown,
  onEdit,
}: {
  number: number;
  exercise: Exercise;
  menuNames: string[];
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteExercise(exercise.id);
      if (!result.ok) {
        setError(result.message ?? "削除できませんでした。");
      }
    });
  }

  const menuNote =
    menuNames.length > 0
      ? `メニュー（${menuNames.map((name) => `「${name}」`).join("")}）からも外れます。`
      : "";

  return (
    <li className="flex flex-col py-1">
      <div className="flex min-h-11 items-center gap-0.5">
        <span className="w-7 shrink-0 text-sm text-muted-foreground tabular-nums">
          {number}
        </span>
        <span className="min-w-0 flex-1 break-words">{exercise.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${exercise.name}を上へ`}
          disabled={disabled || isFirst}
          onClick={onMoveUp}
        >
          <ChevronUp />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${exercise.name}を下へ`}
          disabled={disabled || isLast}
          onClick={onMoveDown}
        >
          <ChevronDown />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${exercise.name}の名前を変える`}
          disabled={deleting}
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${exercise.name}を削除`}
          disabled={deleting}
          onClick={() => setConfirming(true)}
        >
          <Trash2 />
        </Button>
      </div>
      {error && <FieldError>{error}</FieldError>}
      <ConfirmDeleteDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="種目を削除しますか？"
        description={`「${exercise.name}」を削除します。${menuNote}これまでの記録は消えません。`}
        irreversible={false}
        onConfirm={handleDelete}
      />
    </li>
  );
}

function RenameRow({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const [name, setName] = useState(exercise.name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputId = `exercise-${exercise.id}-name`;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      const result = await renameExercise(exercise.id, {}, formData);
      if (result.ok) {
        onClose();
      } else {
        setError(
          result.errors?.name ?? result.message ?? "保存できませんでした。",
        );
      }
    });
  }

  return (
    <li className="py-3">
      <Field>
        <FieldLabel htmlFor={inputId}>種目名</FieldLabel>
        <div className="flex gap-2">
          <Input
            id={inputId}
            type="text"
            autoComplete="off"
            className="h-11"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSave();
              }
            }}
            aria-invalid={error !== null}
            autoFocus
          />
          <Button
            type="button"
            className="h-11"
            onClick={handleSave}
            disabled={pending}
          >
            {pending ? "保存中…" : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={onClose}
            disabled={pending}
          >
            やめる
          </Button>
        </div>
        <FieldError>{error}</FieldError>
      </Field>
    </li>
  );
}
