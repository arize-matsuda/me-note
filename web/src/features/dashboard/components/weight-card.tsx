import Link from "next/link";
import type { WeightRecord } from "@/features/weight/data";
import { formatOneDecimal } from "@/features/weight/format";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatRecordDate } from "@/shared/lib/date";
import { formatWeightChange } from "../summary";

type Props = {
  today: string;
  /** 最新の記録。なければ null */
  latest: WeightRecord | null;
  /** 7日前・30日前と比べた増減（比べる記録がなければ null） */
  changes: { days: number; change: number | null }[];
};

/** 最新の体重・体脂肪率と、7日前・30日前と比べた増減 */
export function WeightCard({ today, latest, changes }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>体重・体脂肪率</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {latest === null ? (
          <>
            <p className="text-muted-foreground">まだ記録がありません。</p>
            <div>
              <Link
                href="/weight"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                体重・体脂肪率を記録する
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-semibold tabular-nums">
                {formatOneDecimal(latest.weight)} kg
              </span>
              {latest.bodyFatPercentage !== null && (
                <span className="tabular-nums">
                  {formatOneDecimal(latest.bodyFatPercentage)} %
                </span>
              )}
              <span className="text-muted-foreground">
                {formatRecordDate(latest.date, today)}
              </span>
            </p>
            <ul className="flex flex-col gap-1">
              {changes.map(({ days, change }) => (
                <li key={days} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{days}日前より</span>
                  <span className="tabular-nums">
                    {change === null
                      ? "比べる記録がありません"
                      : formatWeightChange(change)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
