import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getExercises } from "@/features/workout/data";
import { createMenu } from "@/features/workout-menu/actions";
import { MenuEditor } from "@/features/workout-menu/components/menu-editor";
import { MenuList } from "@/features/workout-menu/components/menu-list";
import { getMenus } from "@/features/workout-menu/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const metadata: Metadata = {
  title: "メニューを管理 | me-note",
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
        <h1 className="text-2xl font-bold md:text-[28px]">メニューを管理</h1>
      </div>
      {/* メニューはリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <MenusSection />
      </Suspense>
    </main>
  );
}

async function MenusSection() {
  const [menus, exercises] = await Promise.all([getMenus(), getExercises()]);

  // 画面の幅が 1024px 以上（lg）のときは、作るフォームと一覧を左右に並べる
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-2">
      <Card className="md:[--card-spacing:--spacing(6)]">
        <CardHeader>
          <CardTitle className="text-base font-bold md:text-[17px]">
            メニューを作る
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MenuEditor
            exercises={exercises}
            action={createMenu}
            submitLabel="作る"
          />
        </CardContent>
      </Card>
      <MenuList menus={menus} exercises={exercises} />
    </div>
  );
}
