"use client";

import { useActionState, useState } from "react";
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
import { saveWeightRecord, type WeightActionState } from "../actions";

type Props = {
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の初期値と、選べる日付の上限に使う */
  today: string;
  /** 前回の記録の値。記録がまだなければ空文字 */
  previousWeight: string;
  previousBodyFatPercentage: string;
};

const initialState: WeightActionState = {};

/** 体重・体脂肪率を記録するフォーム */
export function WeightForm({
  today,
  previousWeight,
  previousBodyFatPercentage,
}: Props) {
  const [state, formAction, pending] = useActionState(
    saveWeightRecord,
    initialState,
  );
  // 値を state で持つ（制御された入力）と、保存のあともエラーのときも入力した値が残る
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState(previousWeight);
  const [bodyFatPercentage, setBodyFatPercentage] = useState(
    previousBodyFatPercentage,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>記録する</CardTitle>
      </CardHeader>
      <CardContent>
        {/* チェックはサーバーの入力チェックにまとめるため、ブラウザのチェックは使わない */}
        <form action={formAction} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="date">日付</FieldLabel>
              <Input
                id="date"
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
              <FieldLabel htmlFor="weight">体重（kg）</FieldLabel>
              <Input
                id="weight"
                name="weight"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="65.3"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                aria-invalid={state.errors?.weight !== undefined}
              />
              <FieldError>{state.errors?.weight}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="bodyFatPercentage">
                体脂肪率（%・空でもよい）
              </FieldLabel>
              <Input
                id="bodyFatPercentage"
                name="bodyFatPercentage"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="18.5"
                value={bodyFatPercentage}
                onChange={(event) => setBodyFatPercentage(event.target.value)}
                aria-invalid={state.errors?.bodyFatPercentage !== undefined}
              />
              <FieldError>{state.errors?.bodyFatPercentage}</FieldError>
            </Field>
            {state.message && <FieldError>{state.message}</FieldError>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "保存中…" : "保存する"}
              </Button>
              {state.ok && !pending && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  保存しました
                </p>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
