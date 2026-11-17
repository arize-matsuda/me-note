import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/shared/auth/components/logout-button";
import { getCurrentUser } from "@/shared/auth/session";
import { buttonVariants } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">me-note</h1>
      <nav>
        <Link href="/weight" className={buttonVariants({ variant: "outline" })}>
          体重・体脂肪率
        </Link>
      </nav>
      {/* ログイン状態はリクエストごとに読むため、Suspense の中で表示する */}
      <Suspense fallback={<p className="text-muted-foreground">読み込み中…</p>}>
        <CurrentUser />
      </Suspense>
    </main>
  );
}

async function CurrentUser() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <p>
        {user.name} さん（{user.email}）でログインしています。
      </p>
      <div>
        <LogoutButton />
      </div>
    </div>
  );
}
