# アーキテクチャ

アプリの **現在の構成** をまとめる。構成を変えたら、このファイルも一緒に更新する。
「なぜそうしたか」は [decisions/](decisions/) に書く。

> 凡例: ✅ 導入済み / 🔜 予定（まだ存在しない）

## 全体像

```
ブラウザ（スマホ / PC）
   │
   ▼
web（Next.js）── Vercel 上で動く
   │        │
   │        └──> ai（Python）🔜 外部には公開しない
   │                 │ 読み取りのみ
   ▼                 ▼
PostgreSQL（Neon）✅
```

## 構成要素

| 要素 | 技術 | 役割 | 状態 |
|---|---|---|---|
| web | Next.js（TypeScript）、Tailwind CSS | 画面、記録の作成・編集・削除、DB スキーマの管理 | ✅ 雛形のみ |
| ai | Python | 分析・要約など | 🔜 |
| データベース | PostgreSQL 18（Neon、シンガポール） | すべての記録とユーザー情報。ブランチ `production`（本番）と `dev`（開発） | ✅ 接続のみ（テーブルなし） |
| DB の操作 | Drizzle ORM（`drizzle-orm/neon-http`）、drizzle-kit | テーブル定義、マイグレーション | ✅ |
| ログイン | Better Auth | ユーザー認証。ユーザー情報は自分の DB に保存 | 🔜 |
| 公開先 | Vercel | web の公開 | 🔜 |
| lint / フォーマット | Biome | コードの書き方をそろえる | ✅ |
| 型チェック | TypeScript（`pnpm typecheck`） | 型の誤りを見つける | ✅ |
| CI | GitHub Actions | PR ごとに lint と型チェックを実行。通らないとマージできない | ✅ |

## 守るルール

- **DB のスキーマとマイグレーションは web だけが管理する**。ai は DB を読み取るだけ
- **ブラウザから ai を直接呼ばない**。必ず Next.js のサーバー側を経由する
- **すべての記録にユーザー ID を持たせる**。データを取得するときは必ずログイン中のユーザーで絞り込む

背景は [decisions/0001](decisions/0001-users-and-devices.md)、[0002](decisions/0002-repository-structure.md)、[0003](decisions/0003-hosting-database-auth.md)。

## データベース

- 接続文字列は環境変数 `DATABASE_URL` で渡す。手元では `web/.env.local` に書く（見本は `web/.env.example`）
- 開発中は Neon の `dev` ブランチを使う。`production` ブランチへの適用方法はステップ7（公開）で決める
- テーブル定義は機能ごとの `schema.ts`（`web/src/**/schema.ts`）に書く
- テーブルを変えるときの手順
  1. `schema.ts` を変更する
  2. `pnpm db:generate` で SQL ファイル（`web/drizzle/`）を作る。この SQL ファイルもコミットし、PR でレビューする
  3. `pnpm db:migrate` で DB に適用する

背景は [decisions/0009](decisions/0009-database.md)。

## ディレクトリ

```
me-note/
├── web/                  # Next.js
│   ├── drizzle.config.ts # マイグレーションの設定 ✅
│   ├── drizzle/          # マイグレーションの SQL ファイル 🔜（最初のテーブルを作るときにできる）
│   └── src/
│       ├── app/          # 画面（ルーティング）✅
│       └── shared/
│           └── db/       # DB クライアント（`db`）✅
├── ai/              # Python 🔜（今は空）
└── docs/            # ドキュメント
```

### web/src の構成方針 🔜

記録の種類ごとにまとめる。最初の機能（体重）を作るときにこの形で作り始める。

```
web/src/
├── app/             # 画面（ルーティング）
├── features/        # 記録の種類ごとのまとまり
│   └── weight/
│       ├── components/   # 入力フォーム、グラフなど
│       ├── actions.ts    # 保存・取得の処理
│       ├── schema.ts     # DB テーブル定義
│       └── types.ts
└── shared/          # 複数の記録で使うもの
```

- 記録の種類どうし（例：`weight` と `workout`）は直接 import しない
- 2つ目の記録を作るときに、本当に共通なものだけ `shared/` に移す
