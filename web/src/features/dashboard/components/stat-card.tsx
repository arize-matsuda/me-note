import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/shared/components/ui/card";

type Props = {
  icon: LucideIcon;
  title: string;
  /** 大きく出す数字。記録がなければ null（「—」を出す） */
  value: string | null;
  unit: string;
  /** 数字の下の補足 */
  note?: ReactNode;
  /** アイコンの色。体重・体脂肪率は紫、筋トレはオレンジ */
  tone: "weight" | "workout";
};

/** ホームの数字のカード（アイコン、名前、大きな数字、補足） */
export function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  note,
  tone,
}: Props) {
  return (
    <Card className="gap-3 px-4 md:px-5">
      <h2 className="flex items-center gap-2.5 text-sm font-medium">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-[10px] md:size-9",
            tone === "weight"
              ? "bg-accent text-accent-foreground"
              : "bg-workout-soft text-workout-foreground",
          )}
          aria-hidden
        >
          <Icon className="size-[18px]" />
        </span>
        {title}
      </h2>
      <p className="text-2xl leading-none font-bold tabular-nums md:text-3xl">
        {value ?? "—"}
        {value !== null && (
          <span className="ml-1 text-sm font-bold md:text-base">{unit}</span>
        )}
      </p>
      {note && (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground md:text-[13px]">
          {note}
        </div>
      )}
    </Card>
  );
}
