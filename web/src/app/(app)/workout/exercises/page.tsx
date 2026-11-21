import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExerciseManager } from "@/features/workout/components/exercise-manager";
import { getExercises } from "@/features/workout/data";
import { getMenuNamesByExercise } from "@/features/workout-menu/data";

export const metadata: Metadata = {
  title: "種目を管理 | me-note",
};

export default function Page() {
  return (
    <main className="flex w-full flex-1 flex-col gap-4 px-4 py-5 md:gap-6 md:px-10 md:py-8">
      <div className="flex flex-col gap-1">
        <Link
          href="/workout"
          className="-ml-1 flex min-h-11 w-fit items-center gap-1 text-sm font-bold text-accent-foreground hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          筋トレ
        </Link>
        <h1 className="text-2xl font-bold md:text-[28px]">種目を管理</h1>
      </div>
      {/* 種目はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <ExercisesSection />
      </Suspense>
    </main>
  );
}

async function ExercisesSection() {
  const [exercises, menuNamesByExercise] = await Promise.all([
    getExercises(),
    getMenuNamesByExercise(),
  ]);
  return (
    <div className="max-w-2xl">
      <ExerciseManager
        exercises={exercises}
        menuNamesByExercise={menuNamesByExercise}
      />
    </div>
  );
}
