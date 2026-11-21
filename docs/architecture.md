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
| web | Next.js（TypeScript）、Tailwind CSS | 画面、記録の作成・編集・削除、DB スキーマの管理 | ✅ ログイン、画面の骨組み（PC はサイドバー、スマホは下のバー）、体重・体脂肪率（入力・一覧・編集・削除・推移グラフ）、筋トレ（入力・一覧・編集・削除、メニューの管理とメニューでの記録、種目の名前・並び順・削除）、カレンダー（月の記録の印と、選んだ日の記録）、ダッシュボード（ホーム）、見た目（案C ラベンダー）、ホーム画面への追加（PWA） |
| 画面部品 | shadcn/ui（Base UI） | ボタン、フォーム、カード、確認ダイアログなど | ✅ |
| グラフ | recharts（shadcn/ui の chart 経由） | 推移の折れ線グラフ | ✅ |
| ai | Python | 分析・要約など | 🔜 |
| データベース | PostgreSQL 18（Neon、シンガポール） | すべての記録とユーザー情報。ブランチ `production`（本番）と `dev`（開発） | ✅ ログイン用、体重・体脂肪率（`weight_record`）、筋トレ（`workout_exercise`・`workout_set`）、筋トレのメニュー（`workout_menu`・`workout_menu_exercise`）のテーブル |
| DB の操作 | Drizzle ORM（`drizzle-orm/neon-http`）、drizzle-kit | テーブル定義、マイグレーション | ✅ |
| ログイン | Better Auth（メールアドレスとパスワード） | ユーザー認証。ユーザー情報は自分の DB に保存 | ✅ |
| 公開先 | Vercel（`*.vercel.app`、実行地域はシンガポール） | web の公開。main にマージすると本番に反映、PR ごとにプレビューを作る | ✅ |
| lint / フォーマット | Biome | コードの書き方をそろえる | ✅ |
| 型チェック | TypeScript（`pnpm typecheck`） | 型の誤りを見つける | ✅ |
| テスト | Vitest（`pnpm test`） | 関数や処理が正しく動くかを確かめる（ユニットテスト） | ✅ |
| CI | GitHub Actions | PR ごとに lint・型チェック・テストを実行。通らないとマージできない | ✅ |

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
- ログイン済みの人が `/login`・`/signup` を開いても、トップには移動させない。無効な Cookie が残っていると、移動を繰り返してしまうため（[decisions/0014](decisions/0014-no-redirect-from-login.md)）
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

## 画面の骨組み

- ログイン後の画面は `web/src/app/(app)/` に置く。`(app)/layout.tsx` が、PC（幅 768px 以上）では左のサイドバー、スマホでは下のバーを付ける
- ナビゲーションの項目は `web/src/shared/navigation/nav-items.ts` にまとめる。新しい記録の画面を作ったら、ここに足す
- PC のサイドバーの一番下に、ユーザー名とログアウトのボタンを出す（`side-nav-user.tsx`。セッションを読むため、`layout.tsx` で `<Suspense>` に入れて渡す）
- PC の本文はサイドバーの右に、最大 1152px で中央に置く。スマホは下のバーと iPhone の画面下の余白の分だけ、本文の下を空ける
- `/login`・`/signup` は `(app)` の外に置き、ナビゲーションを出さない
- 本文を2列にするなど、ページの中の配置を変えるのは、画面の幅が 1024px 以上（`lg`）のときにする。768〜1023px はサイドバーの右の本文が狭いため1列にする

仕様は [features/layout.md](features/layout.md)。

## 見た目

- デザインは「案C ラベンダー」（薄いラベンダーの背景、白いカード、紫のメインの色）。仕様は [features/redesign.md](features/redesign.md)
- 色は `web/src/app/globals.css` のテーマの変数で決め、画面ではその変数（`bg-primary`、`text-muted-foreground` など）を使う。画面ごとに色の値を直接書かない
- 記録の種類ごとの色も変数にする。体重・体脂肪率は `weight`・`body-fat`（紫）、筋トレは `workout`（オレンジ。うすい背景は `workout-soft`、その上の文字は `workout-foreground`）
- フォントは Noto Sans JP（`next/font/google`）。数字は `tabular-nums` で桁をそろえる
- shadcn/ui の部品（`ui/`）は書き換えない。カードの影は `globals.css` で付けている
- プルダウンは、ブラウザ標準の `<select>` ではなく `AppSelect`（`web/src/shared/components/app-select.tsx`。shadcn/ui の Select をアプリの見た目にそろえたもの）を使う。仕様は [features/select.md](features/select.md)
- ダークモードには対応していない

## ホーム画面への追加（PWA）

- `web/src/app/manifest.ts` が、アプリの名前・アイコン・色・全画面で開く設定を `/manifest.webmanifest` で配る。マニフェストのアイコンは `web/public/icon-192.png`・`icon-512.png`
- iPhone 用の設定（ホーム画面での名前、画面上部の見た目）は `web/src/app/layout.tsx` の `metadata.appleWebApp`、画面上部の色は `viewport.themeColor`。色は背景（`--background`）と合わせる
- マニフェストはログインしていなくても読めるよう、`proxy.ts` の「ログインしていなくても開けるもの」に入れている
- Service Worker（オフライン・通知）は入れていない

仕様は [features/pwa.md](features/pwa.md)。

## テスト

- テストファイルは、対象のファイルの隣に `<名前>.test.ts` として置く（例: `web/src/proxy.test.ts`）
- 計算や入力チェックなどの処理を書いたら、テストも書く。見た目だけの変更には書かなくてよい
- DB を読み込んで表示する画面（async のサーバーコンポーネント）は、ユニットテストでは確かめられない。E2E テストは必要になったときに決める

背景は [decisions/0012](decisions/0012-test.md)。

## ディレクトリ

```
me-note/
├── web/                       # Next.js
│   ├── vercel.json            # Vercel の設定（実行地域、本番のマイグレーション）
│   ├── vitest.config.mts      # テスト（Vitest）の設定
│   ├── drizzle.config.ts      # マイグレーションの設定
│   ├── drizzle/               # マイグレーションの SQL ファイル
│   ├── components.json        # shadcn/ui の設定（部品の置き場所など）
│   └── src/
│       ├── proxy.ts           # ログインしていない人を /login に移動させる
│       ├── proxy.test.ts      # proxy.ts のテスト
│       ├── app/               # 画面（ルーティング）
│       │   ├── (app)/         # ログイン後の画面。layout.tsx でサイドバー／下のバーを付ける（URL に (app) は出ない）
│       │   │   ├── page.tsx   # ホーム（/）。ダッシュボード
│       │   │   ├── weight/    # 体重・体脂肪率の画面（/weight）
│       │   │   ├── workout/   # 筋トレの画面（/workout）と、メニューの管理（/workout/menus）、種目の管理（/workout/exercises）
│       │   │   └── calendar/  # カレンダーの画面（/calendar?date=YYYY-MM-DD）
│       │   ├── login/         # ログイン画面（ナビゲーションなし）
│       │   ├── signup/        # 新規登録画面（ナビゲーションなし）
│       │   └── api/auth/      # Better Auth の API
│       ├── features/          # 記録の種類ごとのまとまり
│       │   ├── weight/        # 体重・体脂肪率（テーブル定義、読み書きの処理、入力チェック、画面部品）
│       │   ├── workout/       # 筋トレ（種目とセットのテーブル定義、読み書きの処理、入力チェック、画面部品。種目は削除しても印を付けるだけで、記録を残す）
│       │   ├── workout-menu/  # 筋トレのメニュー（メニューと、その種目の順番のテーブル定義、読み書きの処理、入力チェック、画面部品。/workout で選んだメニューは端末の localStorage に覚える）
│       │   ├── calendar/      # カレンダー（月のマス目の計算、画面部品。体重・筋トレの data.ts を読む）
│       │   └── dashboard/     # ダッシュボード（体重の増減・筋トレの日数などの計算、画面部品。体重・筋トレの data.ts を読む）
│       └── shared/            # 複数の記録で使うもの
│           ├── auth/          # ログイン（設定、テーブル定義、getCurrentUser、画面部品）
│           ├── components/    # アプリ共通の画面部品（ロゴ、プルダウン）
│           ├── components/ui/ # shadcn/ui の部品（lint の対象外）
│           ├── db/            # DB クライアント（`db`）
│           ├── navigation/    # ナビゲーション（項目の一覧、PC のサイドバー、スマホの下のバー）
│           └── lib/           # 共通の関数（`cn`、日本時間の今日などの日付の関数）
├── ai/              # Python 🔜（今は空）
└── docs/            # ドキュメント
```

### web/src の構成方針

記録の種類ごとにまとめる。`features/` は体重・体脂肪率から作り始めた。

```
web/src/
├── app/             # 画面（ルーティング）
├── features/        # 記録の種類ごとのまとまり
│   └── weight/
│       ├── components/     # 画面部品（入力フォーム、一覧、一覧の行の編集・削除、グラフ）
│       ├── schema.ts       # DB テーブル定義
│       ├── data.ts         # 読み取りの処理（ページから呼ぶ）
│       ├── actions.ts      # 保存・更新・削除の処理（Server Action。フォームから呼ぶ）
│       ├── validation.ts   # 入力チェック（ログインや DB に関係しない関数）
│       ├── format.ts       # 表示の形（日付、小数点以下1桁）
│       ├── chart-data.ts   # グラフ用のデータ（直近30日を1日ずつ並べる）
│       └── *.test.ts       # テスト（対象のファイルの隣に置く）
└── shared/          # 複数の記録で使うもの
```

- **データの読み書きは `data.ts` と `actions.ts` に集める**。どちらも最初に `getCurrentUser()` を呼び、ログイン中のユーザーの記録だけを読み書きする。ページやコンポーネントから DB を直接読まない
- `data.ts` が画面に返すのは、画面に必要な項目だけ（ユーザー ID などは返さない）
- 入力チェックは、ログインや DB に関係しない関数として書き、テストする

- 記録の種類どうし（例：`weight` と `workout`）は直接 import しない
- カレンダーやダッシュボードのように、ほかの記録を読んで表示するだけの機能は、記録の `data.ts` の読み取りの関数（例: `getWeightRecordsInRange`）と、表示用の型・関数だけを使ってよい。書き込み（`actions.ts`）や `schema.ts` は使わない
- 2つ目の記録を作るときに、本当に共通なものだけ `shared/` に移す
