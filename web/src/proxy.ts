import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/** ログインしていなくても開ける画面 */
const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * ログインしていない人を /login に、ログイン済みの人が /login・/signup を開いたらトップに移動させる。
 *
 * ここでは Cookie の有無だけを見る（大まかな判定）。Cookie が偽物や期限切れの場合もあるため、
 * データを扱うページ・Server Action では必ず getCurrentUser() でセッションを確認する。
 */
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request) !== null;
  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Better Auth の API、Next.js の内部ファイル、画像などの静的ファイルは対象外にする
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
