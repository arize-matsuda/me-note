"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { WeightRecord } from "../data";
import { WeightListItem } from "./weight-list-item";

type Props = {
  records: WeightRecord[];
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の表示に年を付けるかの判定に使う */
  today: string;
};

/** 記録の一覧（新しい順）。行をタップすると、その行を編集できる */
export function WeightList({ records, today }: Props) {
  // 編集中の記録の ID。同時に編集できるのは1行だけ
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card className="md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-base font-bold md:text-[17px]">
          最近の記録
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ記録がありません。
          </p>
        ) : (
          <ul className="divide-y">
            {records.map((record) => (
              <WeightListItem
                key={record.id}
                record={record}
                today={today}
                editing={record.id === editingId}
                onEdit={() => setEditingId(record.id)}
                onClose={() => setEditingId(null)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
