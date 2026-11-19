"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isActive } from "./is-active";
import { NAV_ITEMS } from "./nav-items";

type Props = {
  /** 一番下に出す、ユーザー名とログアウト（サーバーで読むため、外から渡す） */
  user: ReactNode;
};

/** PC（幅 768px 以上）のサイドバー。左に固定し、いつも開いたまま */
export function SideNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-7 border-r border-sidebar-border bg-sidebar px-4 py-6 md:flex">
      <p className="flex items-center gap-2.5 px-2 text-xl font-bold">
        <span
          className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-base text-primary-foreground"
          aria-hidden
        >
          m
        </span>
        me-note
      </p>
      <nav aria-label="メニュー" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px]",
                active
                  ? "bg-sidebar-accent font-bold text-sidebar-accent-foreground"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border pt-4">{user}</div>
    </aside>
  );
}
