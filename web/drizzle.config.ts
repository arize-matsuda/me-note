import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit は Next.js と違い .env.local を自動で読まないため、ここで読み込む。
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL が設定されていません。web/.env.example を参考に web/.env.local に書いてください。",
  );
}

export default defineConfig({
  dialect: "postgresql",
  // テーブル定義は機能ごとの schema.ts に置く（例: src/features/weight/schema.ts）
  schema: "./src/**/schema.ts",
  // マイグレーションの SQL ファイルの出力先
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
