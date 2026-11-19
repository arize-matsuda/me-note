import { LogoutButton } from "@/shared/auth/components/logout-button";
import { getCurrentUser } from "@/shared/auth/session";

/**
 * サイドバーの一番下に出す、ログイン中のユーザー名とログアウトのボタン。
 * セッションを読むため、呼び出す側は <Suspense> の中に置く。
 */
export async function SideNavUser() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-2.5 px-2">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
        aria-hidden
      >
        {user.name.slice(0, 1)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {user.name} さん
      </span>
      <LogoutButton iconOnly />
    </div>
  );
}
