import {
  CalendarDays,
  Dumbbell,
  House,
  type LucideIcon,
  Weight,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/**
 * ナビゲーション（PC のサイドバーとスマホの下のバー）に並べる項目。
 * 新しい記録の画面を作ったら、ここに足す。
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ホーム", icon: House },
  { href: "/weight", label: "体重・体脂肪率", icon: Weight },
  { href: "/workout", label: "筋トレ", icon: Dumbbell },
  { href: "/calendar", label: "カレンダー", icon: CalendarDays },
];
