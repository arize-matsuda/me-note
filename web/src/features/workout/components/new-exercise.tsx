"use client";

import { useState, useTransition } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { createExercise } from "../actions";
import type { Exercise } from "../data";

/** 初めての種目を、その場で追加する */
export function NewExercise({
  onCreated,
}: {
  /** 追加した種目を受け取る */
  onCreated: (exercise: Exercise) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          ＋ 新しい種目を追加
        </Button>
      </div>
    );
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      const result = await createExercise({}, formData);
      if (result.exercise) {
        onCreated(result.exercise);
        setName("");
        setOpen(false);
      } else {
        setError(
          result.errors?.name ?? result.message ?? "追加できませんでした。",
        );
      }
    });
  }

  return (
    <Field>
      <FieldLabel htmlFor="new-exercise-name">新しい種目</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="new-exercise-name"
          type="text"
          autoComplete="off"
          placeholder="ベンチプレス"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            // 外側のフォーム（セットの追加）が送信されないようにする
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          aria-invalid={error !== null}
        />
        <Button type="button" onClick={handleAdd} disabled={pending}>
          {pending ? "追加中…" : "追加"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
        >
          やめる
        </Button>
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
