import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/shared/db";
import * as schema from "./schema";

/** サーバー側で使う Better Auth の本体。 */
export const auth = betterAuth({
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
