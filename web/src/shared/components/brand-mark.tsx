import { cn } from "cn";

/** 紫の四角のマークと「me-note」。サイドバーとログイン・新規登録の画面に出す */
export function BrandMark({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-2.5 font-bold", className)}>
      <span
        className="flex size-[1.6em] items-center justify-center rounded-[0.5em] bg-primary text-[0.85em] text-primary-foreground"
        aria-hidden
      >
        m
      </span>
      me-note
    </p>
  );
}
