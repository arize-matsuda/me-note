"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { formatRecordDate } from "@/shared/lib/date";
import {
  deleteWeightRecord,
  updateWeightRecord,
  type WeightActionState,
} from "../actions";
import type { WeightRecord } from "../data";
import { formatOneDecimal } from "../format";

type Props = {
  record: WeightRecord;
  today: string;
  /** この行を編集中か */
  editing: boolean;
  /** 編集を始める */
  onEdit: () => void;
  /** 編集を終える（保存・キャンセル・削除のあと） */
  onClose: () => void;
};

/** 一覧の1行。表示と編集を切り替える */
export function WeightListItem({
  record,
  today,
  editing,
  onEdit,
  onClose,
}: Props) {
  const dateLabel = formatRecordDate(record.date, today);

  if (!editing) {
    return (
      <li>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${dateLabel}の記録を編集する`}
          className="grid min-h-11 w-full grid-cols-[1fr_auto_4rem_1.25rem] items-center gap-3 rounded-lg py-1.5 text-left text-sm tabular-nums hover:bg-muted"
        >
          <span>{dateLabel}</span>
          <span className="text-right font-bold">
            {formatOneDecimal(record.weight)} kg
          </span>
          <span className="text-right text-muted-foreground">
            {record.bodyFatPercentage === null
              ? "—"
              : `${formatOneDecimal(record.bodyFatPercentage)} %`}
          </span>
          {/* 行を押すと編集できることを示す */}
          <Pencil className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </li>
    );
  }

  return (
    <li className="py-3">
      <EditForm record={record} dateLabel={dateLabel} onClose={onClose} />
    </li>
  );
}

const initialState: WeightActionState = {};

function EditForm({
  record,
  dateLabel,
  onClose,
}: {
  record: WeightRecord;
  dateLabel: string;
  onClose: () => void;
}) {
  const [state, formAction, saving] = useActionState(
    async (previous: WeightActionState, formData: FormData) => {
      const result = await updateWeightRecord(record.id, previous, formData);
      if (result.ok) {
        onClose();
      }
      return result;
    },
    initialState,
  );
  // 値を state で持つ（制御された入力）と、エラーのときも入力した値が残る
  const [weight, setWeight] = useState(formatOneDecimal(record.weight));
  const [bodyFatPercentage, setBodyFatPercentage] = useState(
    record.bodyFatPercentage === null
      ? ""
      : formatOneDecimal(record.bodyFatPercentage),
  );
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = saving || deleting;

  function handleDelete() {
    setConfirmOpen(false);
    startDelete(async () => {
      const result = await deleteWeightRecord(record.id);
      if (result.ok) {
        onClose();
      } else {
        setDeleteError(result.message ?? "削除できませんでした。");
      }
    });
  }

  const weightId = `weight-${record.id}`;
  const bodyFatId = `body-fat-${record.id}`;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <p className="text-sm font-medium">{dateLabel}</p>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor={weightId}>体重（kg）</FieldLabel>
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
          <FieldLabel htmlFor={bodyFatId}>体脂肪率（%）</FieldLabel>
          <Input
            id={bodyFatId}
            name="bodyFatPercentage"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={bodyFatPercentage}
            onChange={(event) => setBodyFatPercentage(event.target.value)}
            aria-invalid={state.errors?.bodyFatPercentage !== undefined}
          />
        </Field>
      </div>
      <FieldError>{state.errors?.weight}</FieldError>
      <FieldError>{state.errors?.bodyFatPercentage}</FieldError>
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
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {dateLabel}の記録を削除します。元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
