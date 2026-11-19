import {
  CalendarDays,
  Dumbbell,
  Percent,
  Weight as WeightIcon,
} from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { MonthCard } from "@/features/dashboard/components/month-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { TodayCard } from "@/features/dashboard/components/today-card";
import { TrendCard } from "@/features/dashboard/components/trend-card";
import {
  buildDashboardChartData,
  COMPARISON_DAYS,
  countWorkoutDays,
  formatWeightChange,
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
import { formatOneDecimal } from "@/features/weight/format";
import { getChartStartDate } from "@/features/weight/today";
import { getWorkoutDatesInRange } from "@/features/workout/data";
import { LogoutButton } from "@/shared/auth/components/logout-button";
import { getCurrentUser } from "@/shared/auth/session";
import {
  formatLongDate,
  formatRecordDate,
  getTodayInJapan,
} from "@/shared/lib/date";

export default function Home() {
  return (
    <main className="flex w-full flex-1 flex-col gap-1 px-4 py-5 md:px-10 md:py-8">
      <h1 className="text-2xl font-bold md:text-[28px]">ホーム</h1>
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

  // 筋トレの日数（今週・今月）、今月のカレンダー、グラフ（直近30日）に必要な範囲
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
  const hasWeightToday = latest?.date === today;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {user.name} さん、おかえりなさい
        </p>
        {/* PC だけ、今日の日付を出す（スマホは狭いため出さない） */}
        <p className="hidden items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium md:flex">
          <CalendarDays
            className="size-[18px] text-muted-foreground"
            aria-hidden
          />
          {formatLongDate(today)}
        </p>
      </div>

      {/* スマホは数字のカードを2列、1024px 以上は4列、1280px 以上は今日の記録と1行に並べる */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
        <TodayCard
          className="col-span-2 lg:col-span-4 xl:col-span-1"
          hasWeightToday={hasWeightToday}
          hasWorkoutToday={workoutDates.includes(today)}
          weightToday={
            hasWeightToday && latest
              ? `${formatOneDecimal(latest.weight)} kg`
              : null
          }
        />
        <StatCard
          icon={WeightIcon}
          title="体重"
          tone="weight"
          value={latest ? formatOneDecimal(latest.weight) : null}
          unit="kg"
          note={
            latest === null ? (
              <span>まだ記録がありません</span>
            ) : (
              changes.map(({ days, change }) => (
                <span key={days}>
                  {change === null ? (
                    `${days}日前：比べる記録がありません`
                  ) : (
                    <>
                      <span className="font-bold text-accent-foreground tabular-nums">
                        {formatWeightChange(change)}
                      </span>
                      （{days}日前より）
                    </>
                  )}
                </span>
              ))
            )
          }
        />
        <StatCard
          icon={Percent}
          title="体脂肪率"
          tone="weight"
          value={
            latest?.bodyFatPercentage != null
              ? formatOneDecimal(latest.bodyFatPercentage)
              : null
          }
          unit="%"
          note={
            <span>
              {latest?.bodyFatPercentage != null
                ? `${formatRecordDate(latest.date, today)} の記録`
                : "まだ記録がありません"}
            </span>
          }
        />
        <StatCard
          icon={Dumbbell}
          title="今週の筋トレ"
          tone="workout"
          value={String(week)}
          unit="日"
          note={<span>日曜から数える</span>}
        />
        <StatCard
          icon={CalendarDays}
          title="今月の筋トレ"
          tone="workout"
          value={String(month)}
          unit="日"
          note={<span>{Number(today.slice(5, 7))}月</span>}
        />
      </div>

      {/* 1024px 以上は、体重の推移（広め）と今月のカレンダーを左右に並べる */}
      <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TrendCard
          data={buildDashboardChartData(chartRecords, workoutDates, today)}
        />
        <MonthCard today={today} workoutDates={new Set(workoutDates)} />
      </div>

      {/* PC ではサイドバーにログアウトがあるので、スマホだけに出す */}
      <div className="md:hidden">
        <LogoutButton />
      </div>
    </div>
  );
}
