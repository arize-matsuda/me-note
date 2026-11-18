"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/shared/auth/components/logout-button";
import { isActive } from "./is-active";
import { NAV_ITEMS } from "./nav-items";

/** PC（幅 768px 以上）のサイドバー。左に固定し、いつも開いたまま */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r bg-background p-4 md:flex">
      <p className="px-2 pb-6 text-lg font-semibold">me-note</p>
      <nav aria-label="メニュー" className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
