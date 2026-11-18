import { Check, Circle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type Props = {
  hasWeightToday: boolean;
  hasWorkoutToday: boolean;
};

/** 今日、体重を記録したか・筋トレをしたか。まだのものには記録のページへのリンクを出す */
export function TodayCard({ hasWeightToday, hasWorkoutToday }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>今日の記録</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm">
          <TodayItem
            label="体重・体脂肪率"
            done={hasWeightToday}
            href="/weight"
            action="記録する"
          />
          <TodayItem
            label="筋トレ"
            done={hasWorkoutToday}
            href="/workout"
            action="記録する"
          />
        </ul>
      </CardContent>
    </Card>
  );
}

function TodayItem({
  label,
  done,
  href,
  action,
}: {
  label: string;
  done: boolean;
  href: string;
  action: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        {done ? (
          <Check className="size-4 text-foreground" aria-hidden />
        ) : (
          <Circle className="size-4 text-muted-foreground" aria-hidden />
        )}
        {label}
        <span className="text-muted-foreground">
          {done ? "記録済み" : "まだ"}
        </span>
      </span>
      {!done && (
        <Link
          href={href}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label={`${label}を${action}`}
        >
          {action}
        </Link>
      )}
    </li>
  );
}
