import { cn } from "cn";
import Link from "next/link";
import { getMonthGrid } from "@/features/calendar/month";
import { Card } from "@/shared/components/ui/card";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
  /** 日本時間の今日。この日が入っている月を表示する */
  today: string;
  /** 筋トレをした日（`YYYY-MM-DD`） */
  workoutDates: Set<string>;
};

/** 今月のカレンダー。筋トレをした日と今日に印を付ける（見るだけ） */
export function MonthCard({ today, workoutDates }: Props) {
  const { monthStart, weeks } = getMonthGrid(today);
  const [year, month] = monthStart.split("-").map(Number);
  const monthPrefix = monthStart.slice(0, 7);

  return (
    <Card className="gap-3 px-4 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold md:text-[17px]">今月の筋トレ</h2>
        <Link
          href="/calendar"
          className="-my-2 flex min-h-11 items-center text-[13px] font-bold text-accent-foreground hover:underline"
        >
          カレンダーへ
        </Link>
      </div>
      <table className="w-full table-fixed border-collapse text-center text-[13px]">
        <caption className="pb-2 text-sm font-medium">
          {year}年{month}月
        </caption>
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th
                key={weekday}
                scope="col"
                className="pb-1 text-xs font-normal text-muted-foreground"
              >
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) =>
                date.startsWith(monthPrefix) ? (
                  <td key={date} className="h-9 p-0">
                    <DayMark
                      date={date}
                      isToday={date === today}
                      hasWorkout={workoutDates.has(date)}
                    />
                  </td>
                ) : (
                  <td key={date} className="h-9 p-0" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full border border-workout bg-workout-soft"
            aria-hidden
          />
          筋トレをした日
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full border-2 border-primary"
            aria-hidden
          />
          今日
        </span>
      </div>
    </Card>
  );
}

function DayMark({
  date,
  isToday,
  hasWorkout,
}: {
  date: string;
  isToday: boolean;
  hasWorkout: boolean;
}) {
  const day = Number(date.slice(8, 10));
  const label = `${day}日${isToday ? "（今日）" : ""}${hasWorkout ? "：筋トレをした日" : ""}`;

  return (
    <span
      className={cn(
        "mx-auto flex size-8 items-center justify-center rounded-full tabular-nums",
        hasWorkout && "bg-workout-soft font-bold text-workout-foreground",
        isToday && "border-2 border-primary font-bold",
        isToday && !hasWorkout && "text-accent-foreground",
      )}
    >
      <span aria-hidden>{day}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
