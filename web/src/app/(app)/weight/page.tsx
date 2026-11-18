import type { Metadata } from "next";
import { Suspense } from "react";
import { buildChartData } from "@/features/weight/chart-data";
import { WeightChart } from "@/features/weight/components/weight-chart";
import { WeightForm } from "@/features/weight/components/weight-form";
import { WeightList } from "@/features/weight/components/weight-list";
import {
  getLatestWeightRecord,
  getRecentWeightRecords,
  getWeightRecordsForChart,
} from "@/features/weight/data";
import { formatOneDecimal } from "@/features/weight/format";
import { getTodayInJapan } from "@/shared/lib/date";

export const metadata: Metadata = {
  title: "体重・体脂肪率 | me-note",
};

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:mx-0 md:max-w-none">
      <h1 className="text-2xl font-semibold">体重・体脂肪率</h1>
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
  // ログインの確認（リクエストの情報を読む処理）のあとで、現在時刻を使う
  const today = getTodayInJapan();

  // 画面の幅が 1024px 以上（lg）のときは、上の段に入力フォームとグラフを左右に並べ、
  // 下の段に一覧を横いっぱいに置く。それより狭いときは1列（docs/features/layout.md）
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <WeightForm
        today={today}
        previousWeight={latest ? formatOneDecimal(latest.weight) : ""}
        previousBodyFatPercentage={
          latest?.bodyFatPercentage != null
            ? formatOneDecimal(latest.bodyFatPercentage)
            : ""
        }
      />
      <WeightChart data={buildChartData(chartRecords, today)} />
      <div className="lg:col-span-2">
        <WeightList records={records} today={today} />
      </div>
    </div>
  );
}
