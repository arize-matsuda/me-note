import { BottomNav } from "@/shared/navigation/bottom-nav";
import { SideNav } from "@/shared/navigation/side-nav";

/**
 * ログイン後の画面に共通の骨組み。
 * PC（幅 768px 以上）は左のサイドバー、スマホは下のバーで移動する（docs/features/layout.md）。
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:pl-56">
      <SideNav />
      {/* スマホでは、下のバー（高さ 4rem）と iPhone の画面下の余白の分だけ、本文の下を空ける */}
      <div className="flex w-full flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:max-w-5xl md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
