"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { FieldError } from "@/shared/components/ui/field";
import { deleteExerciseSetsOnDate } from "../actions";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

type Props = {
  exerciseId: string;
  exerciseName: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** 表示用の日付（例: `11/18（水）`） */
  dateLabel: string;
  setCount: number;
};

/** 一覧の種目の見出し。その日のその種目のセットを、まとめて削除できる */
export function ExerciseSetsHeader({
  exerciseId,
  exerciseName,
  date,
  dateLabel,
  setCount,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function handleDelete() {
    setConfirmOpen(false);
    setError(null);
    startDelete(async () => {
      const result = await deleteExerciseSetsOnDate(exerciseId, date);
      if (!result.ok) {
        setError(result.message ?? "削除できませんでした。");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm">{exerciseName}</p>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="text-destructive"
          onClick={() => setConfirmOpen(true)}
          disabled={deleting}
          aria-label={`${dateLabel}の${exerciseName}の記録をまとめて削除する`}
        >
          {deleting ? "削除中…" : "まとめて削除"}
        </Button>
      </div>
      <FieldError>{error}</FieldError>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        description={`${dateLabel}の${exerciseName}の記録（${setCount}セット）を削除します。`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
