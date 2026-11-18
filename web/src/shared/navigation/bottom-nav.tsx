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
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
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
                  "flex h-full flex-col items-center justify-center gap-1 text-xs",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
