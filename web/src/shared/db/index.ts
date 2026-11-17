import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL が設定されていません。web/.env.example を参考に web/.env.local に書いてください。",
  );
}

/** アプリ全体で使う DB クライアント。サーバー側のコードからだけ使う。 */
export const db = drizzle(databaseUrl);
