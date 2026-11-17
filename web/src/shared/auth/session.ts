import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * ログイン中のユーザーを返す。ログインしていなければ /login に移動する。
 *
 * proxy.ts は Cookie の有無だけを見る大まかな判定なので、
 * データを扱うページ・Server Action では必ずこの関数でセッションを確認する。
 * リクエストの情報を読むため、呼び出す側は <Suspense> の中に置く。
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const { id, name, email } = session.user;
  return { id, name, email };
}
