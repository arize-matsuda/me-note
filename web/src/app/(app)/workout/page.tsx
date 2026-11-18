import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkoutForm } from "@/features/workout/components/workout-form";
import { WorkoutList } from "@/features/workout/components/workout-list";
import {
  getExercises,
  getLastSetValues,
  getRecentWorkoutSets,
} from "@/features/workout/data";
import { getTodayInJapan } from "@/shared/lib/date";

export const metadata: Metadata = {
  title: "筋トレ | me-note",
};

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:mx-0 md:max-w-none">
      <h1 className="text-2xl font-semibold">筋トレ</h1>
      {/* 記録はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <WorkoutSection />
      </Suspense>
    </main>
  );
}

async function WorkoutSection() {
  const [exercises, sets, lastValues] = await Promise.all([
    getExercises(),
    getRecentWorkoutSets(),
    getLastSetValues(),
  ]);
  // ログインの確認（リクエストの情報を読む処理）のあとで、現在時刻を使う
  const today = getTodayInJapan();

  // 画面の幅が 1024px 以上（lg）のときは、入力フォームと一覧を左右に並べる
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <WorkoutForm
        today={today}
        exercises={exercises}
        lastValues={lastValues}
      />
      <WorkoutList sets={sets} today={today} />
    </div>
  );
}
