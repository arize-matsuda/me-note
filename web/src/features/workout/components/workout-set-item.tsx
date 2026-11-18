"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  deleteWorkoutSet,
  updateWorkoutSet,
  type WorkoutActionState,
} from "../actions";
import type { WorkoutSet } from "../data";
import { formatSet } from "../format";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

type Props = {
  set: WorkoutSet;
  /** その種目の中で何セット目か（1から） */
  number: number;
  /** このセットを編集中か */
  editing: boolean;
  onEdit: () => void;
  /** 編集を終える（保存・キャンセル・削除のあと） */
  onClose: () => void;
};

/** 一覧の1セット。表示と編集を切り替える */
export function WorkoutSetItem({
  set,
  number,
  editing,
  onEdit,
  onClose,
}: Props) {
  const label = `${number}. ${formatSet(set.weight, set.reps)}`;

  if (!editing) {
    return (
      <li>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${set.exerciseName}の${number}セット目を編集する`}
          className="w-full rounded-md px-1 py-1 text-left text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          {label}
        </button>
      </li>
    );
  }

  return (
    <li className="py-2">
      <EditForm set={set} number={number} onClose={onClose} />
    </li>
  );
}

const initialState: WorkoutActionState = {};

function EditForm({
  set,
  number,
  onClose,
}: {
  set: WorkoutSet;
  number: number;
  onClose: () => void;
}) {
  const [state, formAction, saving] = useActionState(
    async (previous: WorkoutActionState, formData: FormData) => {
      const result = await updateWorkoutSet(set.id, previous, formData);
      if (result.ok) {
        onClose();
      }
      return result;
    },
    initialState,
  );
  // 値を state で持つ（制御された入力）と、エラーのときも入力した値が残る
  const [weight, setWeight] = useState(
    set.weight === null ? "" : String(set.weight),
  );
  const [reps, setReps] = useState(String(set.reps));
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = saving || deleting;

  function handleDelete() {
    setConfirmOpen(false);
    startDelete(async () => {
      const result = await deleteWorkoutSet(set.id);
      if (result.ok) {
        onClose();
      } else {
        setDeleteError(result.message ?? "削除できませんでした。");
      }
    });
  }

  const weightId = `workout-set-weight-${set.id}`;
  const repsId = `workout-set-reps-${set.id}`;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <p className="text-sm font-medium">
        {set.exerciseName} {number}セット目
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor={weightId}>重量（kg・自重は空）</FieldLabel>
          <Input
            id={weightId}
            name="weight"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            aria-invalid={state.errors?.weight !== undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={repsId}>回数</FieldLabel>
          <Input
            id={repsId}
            name="reps"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            aria-invalid={state.errors?.reps !== undefined}
          />
        </Field>
      </div>
      <FieldError>{state.errors?.weight}</FieldError>
      <FieldError>{state.errors?.reps}</FieldError>
      <FieldError>{state.message ?? deleteError}</FieldError>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {saving ? "保存中…" : "保存"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onClose}
          disabled={busy}
        >
          キャンセル
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="ml-auto"
          onClick={() => setConfirmOpen(true)}
          disabled={busy}
        >
          {deleting ? "削除中…" : "削除"}
        </Button>
      </div>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        description={`${set.exerciseName}の${number}セット目（${formatSet(set.weight, set.reps)}）を削除します。`}
        onConfirm={handleDelete}
      />
    </form>
  );
}
