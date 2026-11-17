# 0009: データベースの操作と開発環境

- 日付: 2026-11-17
- 状態: 採用

## 背景

DB は Neon（PostgreSQL）を使う（[0003](0003-hosting-database-auth.md)）。
テーブルの定義・変更の方法と、開発中にどの DB を使うかを決める必要がある。

## 決定

- **DB の操作には Drizzle ORM を使う**。接続には Neon の HTTP ドライバ（`@neondatabase/serverless`、`drizzle-orm/neon-http`）を使う
- **テーブル定義は機能ごとの `schema.ts` に TypeScript で書く**（例: `web/src/features/weight/schema.ts`）
- **テーブルの変更はマイグレーションで行う**
  - `pnpm db:generate` で変更内容を SQL ファイル（`web/drizzle/`）にし、コミットして PR でレビューする
  - `pnpm db:migrate` でその SQL を DB に適用する
  - 定義を DB に直接反映する方法（`drizzle-kit push`）は使わない
- **開発中は Neon の `dev` ブランチを使う**。本番は `production` ブランチ
- **DB の地域はシンガポール**（`ap-southeast-1`）。Vercel の実行地域もこれに合わせる（ステップ7）
- 接続文字列は環境変数 `DATABASE_URL` で渡し、手元では `web/.env.local` に書く

## 検討した案

| 項目 | 採用 | 採用しなかった案 |
|---|---|---|
| ORM | Drizzle | Prisma（専用の言語でテーブルを1か所にまとめて書く。コード生成が必要） |
| 開発用 DB | Neon の `dev` ブランチ | 手元の Docker の PostgreSQL（Docker を毎回起動する必要がある） |
| 変更の反映 | SQL ファイルを残して適用（migrate） | 定義を直接反映（push。何が変わったかの記録が残らない） |

## 理由

- Drizzle はテーブル定義を TypeScript で書くので、機能ごとに `schema.ts` を置く構成と合う。Neon と Better Auth にも対応している
- Neon のブランチなら、手元に何も入れずに本番と同じ環境で開発できる
- マイグレーションの SQL ファイルが PR に入ることで、テーブルの変更内容を人がレビューできる
- 日本から使うため、Neon で選べる中で近いシンガポールにした

## 注意

- HTTP ドライバは、複数の処理をまとめる「トランザクション」の一部の書き方に対応していない。必要になったら WebSocket のドライバ（`drizzle-orm/neon-serverless`）への切り替えを検討する
- pnpm 12 では、インストール時にスクリプトを実行するパッケージを明示する必要がある。drizzle-kit が使う `esbuild` は `web/pnpm-workspace.yaml` で「実行しない」にしている（実行しなくても動く）
- `production` ブランチへのマイグレーションの適用方法は、公開するとき（ステップ7）に決める
