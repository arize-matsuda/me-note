/**
 * 今いるページ（pathname）が、ナビゲーションの項目（href）にあたるか。
 * ホーム（`/`）は完全に一致するときだけ。ほかは、その下のページ（例: `/weight/...`）も含む。
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
