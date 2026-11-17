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
| web | Next.js（TypeScript）、Tailwind CSS | 画面、記録の作成・編集・削除、DB スキーマの管理 | ✅ ログインまで |
| 画面部品 | shadcn/ui（Base UI） | ボタン、フォーム、カードなど | ✅ |
| ai | Python | 分析・要約など | 🔜 |
| データベース | PostgreSQL 18（Neon、シンガポール） | すべての記録とユーザー情報。ブランチ `production`（本番）と `dev`（開発） | ✅ ログイン用のテーブルのみ |
| DB の操作 | Drizzle ORM（`drizzle-orm/neon-http`）、drizzle-kit | テーブル定義、マイグレーション | ✅ |
| ログイン | Better Auth（メールアドレスとパスワード） | ユーザー認証。ユーザー情報は自分の DB に保存 | ✅ |
| 公開先 | Vercel（`*.vercel.app`、実行地域はシンガポール） | web の公開。main にマージすると本番に反映、PR ごとにプレビューを作る | ✅ |
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
- 手元の開発と Vercel のプレビューは Neon の `dev` ブランチ、本番は `production` ブランチを使う
- テーブル定義は機能ごとの `schema.ts`（`web/src/**/schema.ts`）に書く
- テーブルを変えるときの手順
  1. `schema.ts` を変更する
  2. `pnpm db:generate` で SQL ファイル（`web/drizzle/`）を作る。この SQL ファイルもコミットし、PR でレビューする
  3. `pnpm db:migrate` で `dev` ブランチに適用する
  4. PR がマージされると、本番デプロイのときに `production` ブランチへ自動で適用される（`web/vercel.json`）

背景は [decisions/0009](decisions/0009-database.md)、[0011](decisions/0011-deploy.md)。

## ログイン

- `/login`（ログイン）と `/signup`（新規登録）以外の画面は、すべてログインが必要
- `web/src/proxy.ts` が Cookie の有無だけを見て、ログインしていない人を `/login` に移動させる（大まかな判定）
- **データを扱うページ・Server Action では、必ず `getCurrentUser()`（`web/src/shared/auth/session.ts`）でセッションを確認する**
- `getCurrentUser()` はリクエストの情報を読むため、呼び出すコンポーネントは `<Suspense>` の中に置く（Cache Components の決まり）
- ブラウザ側の操作（登録・ログイン・ログアウト）は `authClient`（`web/src/shared/auth/client.ts`）を使う
- 環境変数: `BETTER_AUTH_SECRET`（ランダムな秘密の値）、`BETTER_AUTH_URL`（アプリの URL）
- Vercel のプレビューでは、`BETTER_AUTH_URL` の代わりに、そのデプロイの URL をログインで許可する（`web/src/shared/auth/server.ts`）

背景は [decisions/0010](decisions/0010-auth.md)、[0011](decisions/0011-deploy.md)。

## 公開（Vercel）

- Vercel と GitHub を連携している。Root Directory は `web`
- main にマージすると本番に反映される。本番デプロイでは、ビルドの前に `pnpm db:migrate` を実行する（失敗したらデプロイも止まる）
- PR ごとにプレビューを作る。プレビューは `dev` ブランチの DB を使い、マイグレーションは実行しない
- 環境変数は Vercel の管理画面で設定する（一覧は [decisions/0011](decisions/0011-deploy.md)）

## ディレクトリ

```
me-note/
├── web/                       # Next.js
│   ├── vercel.json            # Vercel の設定（実行地域、本番のマイグレーション）
│   ├── drizzle.config.ts      # マイグレーションの設定
│   ├── drizzle/               # マイグレーションの SQL ファイル
│   ├── components.json        # shadcn/ui の設定（部品の置き場所など）
│   └── src/
│       ├── proxy.ts           # ログインしていない人を /login に移動させる
│       ├── app/               # 画面（ルーティング）
│       │   ├── login/         # ログイン画面
│       │   ├── signup/        # 新規登録画面
│       │   └── api/auth/      # Better Auth の API
│       └── shared/            # 複数の記録で使うもの
│           ├── auth/          # ログイン（設定、テーブル定義、getCurrentUser、画面部品）
│           ├── components/ui/ # shadcn/ui の部品（lint の対象外）
│           ├── db/            # DB クライアント（`db`）
│           └── lib/           # 共通の関数（`cn` など）
├── ai/              # Python 🔜（今は空）
└── docs/            # ドキュメント
```

### web/src の構成方針

記録の種類ごとにまとめる。`features/` は最初の機能（体重）を作るときに作り始める 🔜。

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
