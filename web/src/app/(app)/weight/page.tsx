import type { Metadata } from "next";
import { Suspense } from "react";
import {
  formatWeightChange,
  getComparisonDate,
  getWeightChange,
} from "@/features/dashboard/summary";
import { buildChartData } from "@/features/weight/chart-data";
import { WeightChart } from "@/features/weight/components/weight-chart";
import { WeightForm } from "@/features/weight/components/weight-form";
import { WeightList } from "@/features/weight/components/weight-list";
import {
  getLatestWeightRecord,
  getRecentWeightRecords,
  getWeightRecordOnOrBefore,
  getWeightRecordsForChart,
} from "@/features/weight/data";
import { formatOneDecimal } from "@/features/weight/format";
import { formatRecordDate, getTodayInJapan } from "@/shared/lib/date";

export const metadata: Metadata = {
  title: "体重・体脂肪率 | me-note",
};

/** 体重のカードに出す増減（ホームと同じ、最新の記録の7日前と比べる） */
const CHANGE_DAYS = 7;

export default function Page() {
  return (
    <main className="flex w-full flex-1 flex-col gap-4 px-4 py-5 md:gap-6 md:px-10 md:py-8">
      <h1 className="text-2xl font-bold md:text-[28px]">体重・体脂肪率</h1>
      {/* 記録はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <WeightSection />
      </Suspense>
    </main>
  );
}

async function WeightSection() {
  const [latest, records, chartRecords] = await Promise.all([
    getLatestWeightRecord(),
    getRecentWeightRecords(),
    getWeightRecordsForChart(),
  ]);
  const base =
    latest === null
      ? null
      : await getWeightRecordOnOrBefore(
          getComparisonDate(latest.date, CHANGE_DAYS),
        );
  // ログインの確認（リクエストの情報を読む処理）のあとで、現在時刻を使う
  const today = getTodayInJapan();

  const change = latest === null ? null : getWeightChange(latest, base);
  const bodyFat = latest?.bodyFatPercentage ?? null;

  // 画面の幅が 1024px 以上（lg）のときは、左に入力フォームと一覧、右にグラフを置く。
  // それより狭いときは、入力フォーム → グラフ → 一覧 の順に1列で並べる
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
      <div className="lg:col-start-1 lg:row-start-1">
        <WeightForm
          today={today}
          previousWeight={latest ? formatOneDecimal(latest.weight) : ""}
          previousBodyFatPercentage={
            bodyFat !== null ? formatOneDecimal(bodyFat) : ""
          }
        />
      </div>
      <div className="flex flex-col gap-4 md:gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <WeightChart
          data={buildChartData(chartRecords, today)}
          latestWeight={latest ? formatOneDecimal(latest.weight) : null}
          weightNote={
            change === null
              ? null
              : `${formatWeightChange(change)}（${CHANGE_DAYS}日前より）`
          }
          latestBodyFat={bodyFat !== null ? formatOneDecimal(bodyFat) : null}
          bodyFatNote={
            latest !== null && bodyFat !== null
              ? `${formatRecordDate(latest.date, today)} の記録`
              : null
          }
        />
      </div>
      <div className="lg:col-start-1 lg:row-start-2">
        <WeightList records={records} today={today} />
      </div>
    </div>
  );
}
