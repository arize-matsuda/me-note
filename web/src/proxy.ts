import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * ログインしていなくても開けるもの。
 * マニフェストは、ブラウザが Cookie を付けずに読みに来ることがあるため、ここに入れる
 */
const PUBLIC_PATHS = ["/login", "/signup", "/manifest.webmanifest"];

/**
 * ログインしていない人を /login に移動させる。
 *
 * ここでは Cookie の有無だけを見る（大まかな判定）。Cookie が偽物や期限切れの場合もあるため、
 * データを扱うページ・Server Action では必ず getCurrentUser() でセッションを確認する。
 *
 * 「Cookie があればログイン済み」とみなして /login からほかへ移す処理はしない。
 * 無効な Cookie が残っていると、/login と / の間で移動を繰り返してしまうため（decisions/0014）。
 */
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request) !== null;
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Better Auth の API、Next.js の内部ファイル、画像などの静的ファイルは対象外にする
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
