import { ListOrdered } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { WorkoutForm } from "@/features/workout/components/workout-form";
import { WorkoutList } from "@/features/workout/components/workout-list";
import {
  getExercises,
  getLastSetValues,
  getRecentWorkoutSets,
} from "@/features/workout/data";
import { getMenus } from "@/features/workout-menu/data";
import { buttonVariants } from "@/shared/components/ui/button";
import { getTodayInJapan } from "@/shared/lib/date";
import { cn } from "@/shared/lib/utils";

export const metadata: Metadata = {
  title: "筋トレ | me-note",
};

export default function Page() {
  return (
    <main className="flex w-full flex-1 flex-col gap-4 px-4 py-5 md:gap-6 md:px-10 md:py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold md:text-[28px]">筋トレ</h1>
        <Link
          href="/workout/menus"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 gap-1.5")}
        >
          <ListOrdered aria-hidden="true" />
          メニューを管理
        </Link>
      </div>
      {/* 記録はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <WorkoutSection />
      </Suspense>
    </main>
  );
}

async function WorkoutSection() {
  const [exercises, sets, lastValues, menus] = await Promise.all([
    getExercises(),
    getRecentWorkoutSets(),
    getLastSetValues(),
    getMenus(),
  ]);
  // ログインの確認（リクエストの情報を読む処理）のあとで、現在時刻を使う
  const today = getTodayInJapan();

  // 画面の幅が 1024px 以上（lg）のときは、入力フォームと一覧を左右に並べる
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
      <WorkoutForm
        today={today}
        exercises={exercises}
        lastValues={lastValues}
        menus={menus}
        sets={sets}
      />
      <WorkoutList sets={sets} today={today} />
    </div>
  );
}
