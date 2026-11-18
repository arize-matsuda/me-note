import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { getMonthGrid, shiftMonth } from "../month";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  /** 選んだ日（`YYYY-MM-DD`）。この日が入っている月を表示する */
  selectedDate: string;
  /** 日本時間の今日 */
  today: string;
  /** 体重・体脂肪率を記録した日 */
  weightDates: Set<string>;
  /** 筋トレを記録した日 */
  workoutDates: Set<string>;
};

/** 日付を選んだときの URL */
export function calendarHref(date: string): string {
  return `/calendar?date=${date}`;
}

/** 月のカレンダー（日曜始まり）。記録がある日に印を出す */
export function CalendarMonth({
  selectedDate,
  today,
  weightDates,
  workoutDates,
}: Props) {
  const { monthStart, weeks } = getMonthGrid(selectedDate);
  const [year, month] = monthStart.split("-").map(Number);
  const monthLabel = `${year}年${month}月`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Link
            href={calendarHref(shiftMonth(monthStart, -1))}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="前の月"
          >
            <ChevronLeft aria-hidden />
          </Link>
          <CardTitle>{monthLabel}</CardTitle>
          <Link
            href={calendarHref(shiftMonth(monthStart, 1))}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="次の月"
          >
            <ChevronRight aria-hidden />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <table className="w-full table-fixed border-collapse text-center text-sm">
          <thead>
            <tr>
              {WEEKDAYS.map((weekday) => (
                <th
                  key={weekday}
                  scope="col"
                  className="pb-2 text-xs font-normal text-muted-foreground"
                >
                  {weekday}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]}>
                {week.map((date) => (
                  <td key={date} className="p-0.5">
                    <DayCell
                      date={date}
                      inMonth={date.startsWith(monthStart.slice(0, 7))}
                      isToday={date === today}
                      isSelected={date === selectedDate}
                      hasWeight={weightDates.has(date)}
                      hasWorkout={workoutDates.has(date)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-sky-500" aria-hidden />
            体重・体脂肪率
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" aria-hidden />
            筋トレ
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DayCell({
  date,
  inMonth,
  isToday,
  isSelected,
  hasWeight,
  hasWorkout,
}: {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasWeight: boolean;
  hasWorkout: boolean;
}) {
  const day = Number(date.slice(8, 10));
  const records = [hasWeight && "体重・体脂肪率", hasWorkout && "筋トレ"]
    .filter(Boolean)
    .join("、");

  return (
    <Link
      href={calendarHref(date)}
      scroll={false}
      aria-current={isSelected ? "date" : undefined}
      aria-label={`${date}${isToday ? "（今日）" : ""}${records ? `：${records}の記録あり` : ""}`}
      data-weight={hasWeight || undefined}
      data-workout={hasWorkout || undefined}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-1 rounded-lg",
        inMonth ? "text-foreground" : "text-muted-foreground/50",
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/60",
        isToday && !isSelected && "ring-1 ring-foreground/40",
      )}
    >
      <span className={cn("leading-none", isToday && "font-semibold")}>
        {day}
      </span>
      <span className="flex h-1.5 gap-1" aria-hidden>
        {hasWeight && <span className="size-1.5 rounded-full bg-sky-500" />}
        {hasWorkout && <span className="size-1.5 rounded-full bg-amber-500" />}
      </span>
    </Link>
  );
}
