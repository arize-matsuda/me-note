import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { WeightRecord } from "../data";
import { formatOneDecimal, formatRecordDate } from "../format";

type Props = {
  records: WeightRecord[];
  /** 日本時間の今日（`YYYY-MM-DD`）。日付の表示に年を付けるかの判定に使う */
  today: string;
};

/** 記録の一覧（新しい順） */
export function WeightList({ records, today }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>記録</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ記録がありません。
          </p>
        ) : (
          <ul className="divide-y">
            {records.map((record) => (
              <li
                key={record.id}
                className="grid grid-cols-[1fr_auto_4.5rem] items-center gap-3 py-2 text-sm tabular-nums"
              >
                <span>{formatRecordDate(record.date, today)}</span>
                <span className="text-right">
                  {formatOneDecimal(record.weight)} kg
                </span>
                <span className="text-right text-muted-foreground">
                  {record.bodyFatPercentage === null
                    ? "—"
                    : `${formatOneDecimal(record.bodyFatPercentage)} %`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
