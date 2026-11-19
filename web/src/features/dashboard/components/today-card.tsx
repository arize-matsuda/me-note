import { cn } from "cn";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/shared/components/ui/card";

type Props = {
  hasWeightToday: boolean;
  hasWorkoutToday: boolean;
  /** 今日の体重（記録済みのとき、右に出す） */
  weightToday: string | null;
  className?: string;
};

/** 今日、体重を記録したか・筋トレをしたか。まだのものには記録のページへのリンクを出す */
export function TodayCard({
  hasWeightToday,
  hasWorkoutToday,
  weightToday,
  className,
}: Props) {
  const doneCount = [hasWeightToday, hasWorkoutToday].filter(Boolean).length;

  return (
    <Card className={cn("gap-3 px-4 md:px-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold">今日の記録</h2>
        <span className="text-xs text-muted-foreground md:text-[13px]">
          {doneCount} / 2 済み
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        <TodayItem
          label="体重・体脂肪率"
          done={hasWeightToday}
          href="/weight"
          detail={weightToday}
        />
        <TodayItem label="筋トレ" done={hasWorkoutToday} href="/workout" />
      </ul>
    </Card>
  );
}

function TodayItem({
  label,
  done,
  href,
  detail = null,
}: {
  label: string;
  done: boolean;
  href: string;
  detail?: string | null;
}) {
  return (
    <li className="flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm">
      {done ? (
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <span
          className="size-[22px] shrink-0 rounded-full border-2 border-input"
          aria-hidden
        />
      )}
      <span className="flex-1">
        {label}
        <span className="sr-only">{done ? "：記録済み" : "：まだ"}</span>
      </span>
      {done ? (
        detail && <span className="font-bold tabular-nums">{detail}</span>
      ) : (
        <Link
          href={href}
          className="-my-1 flex min-h-11 items-center gap-0.5 font-bold text-accent-foreground hover:underline"
          aria-label={`${label}を記録する`}
        >
          記録する
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </li>
  );
}
