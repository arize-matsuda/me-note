"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "./is-active";
import { NAV_ITEMS } from "./nav-items";

/**
 * スマホ（幅 768px 未満）の下のバー。画面の下に固定する。
 * iPhone の画面下の操作バーと重ならないよう、その余白（safe-area-inset-bottom）の分だけ上にずらす。
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="メニュー"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex h-16">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[11px]",
                  active
                    ? "font-bold text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                {/* 今いるページは、アイコンの後ろにうすい紫の丸い背景を付ける */}
                <span
                  className={cn(
                    "flex rounded-full px-4 py-1",
                    active && "bg-accent",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
