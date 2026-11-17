import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/shared/db";
import * as schema from "./schema";

/**
 * Vercel のプレビューのときだけ、そのデプロイの URL をアプリの URL として許可する。
 * プレビューの URL は PR ごとに変わるため、BETTER_AUTH_URL に固定できない。
 * VERCEL_URL（デプロイごとの URL）と VERCEL_BRANCH_URL（ブランチごとの URL）は Vercel が自動で設定する。
 * 本番と手元の開発では undefined にして、BETTER_AUTH_URL を使う。
 */
function previewBaseURL() {
  if (process.env.VERCEL_ENV !== "preview") {
    return undefined;
  }
  const allowedHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
  ].filter((host): host is string => Boolean(host));
  return { allowedHosts, protocol: "https" as const };
}

/** サーバー側で使う Better Auth の本体。 */
export const auth = betterAuth({
  baseURL: previewBaseURL(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Server Action からログイン・ログアウトしたときに Cookie を設定するため。最後に置く
  plugins: [nextCookies()],
});
