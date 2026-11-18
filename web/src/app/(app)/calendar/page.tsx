import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarMonth } from "@/features/calendar/components/calendar-month";
import { DayRecords } from "@/features/calendar/components/day-records";
import { getMonthGrid, parseSelectedDate } from "@/features/calendar/month";
import { getWeightRecordsInRange } from "@/features/weight/data";
import { getWorkoutSetsInRange } from "@/features/workout/data";
import { getTodayInJapan } from "@/shared/lib/date";

export const metadata: Metadata = {
  title: "カレンダー | me-note",
};

export default function Page({ searchParams }: PageProps<"/calendar">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:mx-0 md:max-w-none">
      <h1 className="text-2xl font-semibold">カレンダー</h1>
      {/* 記録と URL はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <CalendarSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function CalendarSection({
  searchParams,
}: {
  searchParams: PageProps<"/calendar">["searchParams"];
}) {
  const { date } = await searchParams;
  const today = getTodayInJapan();
  const selectedDate = parseSelectedDate(date, today);

  // マス目に出る範囲（前後の月の日を含む）の記録を読む
  const { weeks } = getMonthGrid(selectedDate);
  const start = weeks[0][0];
  const end = weeks.at(-1)?.[6] ?? start;
  const [weightRecords, workoutSets] = await Promise.all([
    getWeightRecordsInRange(start, end),
    getWorkoutSetsInRange(start, end),
  ]);

  // 画面の幅が 1024px 以上（lg）のときは、カレンダーと選んだ日の記録を左右に並べる
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <CalendarMonth
        selectedDate={selectedDate}
        today={today}
        weightDates={new Set(weightRecords.map((record) => record.date))}
        workoutDates={new Set(workoutSets.map((set) => set.date))}
      />
      <DayRecords
        date={selectedDate}
        today={today}
        weight={
          weightRecords.find((record) => record.date === selectedDate) ?? null
        }
        workoutSets={workoutSets.filter((set) => set.date === selectedDate)}
      />
    </div>
  );
}
