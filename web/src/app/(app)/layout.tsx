import { Suspense } from "react";
import { BottomNav } from "@/shared/navigation/bottom-nav";
import { SideNav } from "@/shared/navigation/side-nav";
import { SideNavUser } from "@/shared/navigation/side-nav-user";

/**
 * ログイン後の画面に共通の骨組み。
 * PC（幅 768px 以上）は左のサイドバー、スマホは下のバーで移動する（docs/features/layout.md）。
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:pl-60">
      <SideNav
        user={
          // ユーザー名はセッションを読むため、Suspense の中で表示する
          <Suspense fallback={null}>
            <SideNavUser />
          </Suspense>
        }
      />
      {/* スマホでは、下のバー（高さ 4rem）と iPhone の画面下の余白の分だけ、本文の下を空ける。
          PC では本文を最大 1152px にし、サイドバーの右の残りの幅の中で中央に置く */}
      <div className="flex w-full flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:mx-auto md:max-w-6xl md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
