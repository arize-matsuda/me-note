import { connection } from "next/server";
import { Suspense } from "react";
import { TodayCard } from "@/features/dashboard/components/today-card";
import { TrendCard } from "@/features/dashboard/components/trend-card";
import { WeightCard } from "@/features/dashboard/components/weight-card";
import { WorkoutCard } from "@/features/dashboard/components/workout-card";
import {
  buildDashboardChartData,
  COMPARISON_DAYS,
  countWorkoutDays,
  getComparisonDate,
  getMonthStart,
  getWeekStart,
  getWeightChange,
} from "@/features/dashboard/summary";
import {
  getLatestWeightRecord,
  getWeightRecordOnOrBefore,
  getWeightRecordsForChart,
} from "@/features/weight/data";
import { getChartStartDate } from "@/features/weight/today";
import { getWorkoutDatesInRange } from "@/features/workout/data";
import { LogoutButton } from "@/shared/auth/components/logout-button";
import { getCurrentUser } from "@/shared/auth/session";
import { getTodayInJapan } from "@/shared/lib/date";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:mx-0 md:max-w-none">
      <h1 className="text-2xl font-semibold">ホーム</h1>
      {/* 記録はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const user = await getCurrentUser();
  // 現在時刻を使う前に、リクエストを待つことを示す（先読みの中で new Date() を使わないため）
  await connection();
  const today = getTodayInJapan();

  // 筋トレの日数（今週・今月）とグラフ（直近30日）に必要な範囲
  const workoutStart = [
    getWeekStart(today),
    getMonthStart(today),
    getChartStartDate(today),
  ].sort()[0];

  const [latest, chartRecords, workoutDates] = await Promise.all([
    getLatestWeightRecord(),
    getWeightRecordsForChart(),
    getWorkoutDatesInRange(workoutStart, today),
  ]);
  const bases = await Promise.all(
    COMPARISON_DAYS.map((days) =>
      latest === null
        ? null
        : getWeightRecordOnOrBefore(getComparisonDate(latest.date, days)),
    ),
  );
  const changes = COMPARISON_DAYS.map((days, index) => ({
    days,
    change: latest === null ? null : getWeightChange(latest, bases[index]),
  }));
  const { week, month } = countWorkoutDays(workoutDates, today);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">{user.name} さん</p>
      {/* 画面の幅が 1024px 以上（lg）のときは、カードを2列に並べる */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TodayCard
          hasWeightToday={latest?.date === today}
          hasWorkoutToday={workoutDates.includes(today)}
        />
        <WeightCard today={today} latest={latest} changes={changes} />
        <WorkoutCard week={week} month={month} />
        <TrendCard
          data={buildDashboardChartData(chartRecords, workoutDates, today)}
        />
      </div>
      {/* PC ではサイドバーにログアウトがあるので、スマホだけに出す */}
      <div className="md:hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
