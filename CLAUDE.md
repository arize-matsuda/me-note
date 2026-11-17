# me-note

体重・筋トレ・家計簿など、生活の記録を1つにまとめて管理する個人用アプリ。

## 最初に読むもの

作業を始める前に [docs/README.md](docs/README.md) を読み、作業に関係するドキュメントを確認する。

- 何を・なぜ作るか、ロードマップ → [docs/product.md](docs/product.md)
- 現在の構成と守るルール → [docs/architecture.md](docs/architecture.md)
- 決定の理由 → [docs/decisions/](docs/decisions/)
- 機能の仕様 → [docs/features/](docs/features/)

## 構成

- `web/` — Next.js（TypeScript）。画面と記録の管理
- `ai/` — Python。**まだ実装しない**（今は空）
- `docs/` — ドキュメント

## コマンド

`web/` で実行する。パッケージマネージャーは pnpm（npm / yarn は使わない）。

```bash
pnpm dev              # 開発サーバー（http://localhost:3000）
pnpm lint             # Biome（lint とフォーマットのチェック）
pnpm format           # フォーマットを適用
pnpm exec tsc --noEmit   # 型チェック
```

## 振る舞いのルール

### 進め方

- **作業前に計画を示し、承認を得てから実装する**
- **頼まれていないことはしない**。ファイルの追加、ライブラリの導入、設定の変更などを、ついでに行わない。必要だと思ったら提案にとどめる
- **仕様が曖昧なときは、推測せずに質問する**
- **新しいライブラリを入れるときは、事前に理由を説明して承認を得る**
- **機能の順番は提案・変更しない**。順番は人が決める（[docs/product.md](docs/product.md) のロードマップ）
- **`ai/` には、指示があるまでファイルを作らない**

### issue と PR

詳しくは [docs/decisions/0006](docs/decisions/0006-issue-workflow.md) と [0007](docs/decisions/0007-branch-and-pr.md)。

- **1つの機能を親 issue、その中のタスクをサブ issue で管理する**
- **仕様は `docs/features/<機能名>.md` に書き、親 issue からリンクする**
- **issue は案を示し、承認されてから作成する**。テンプレートは `.github/ISSUE_TEMPLATE/` のものを使う
- **1つのサブ issue ＝ 1つのブランチ ＝ 1つの PR**
  - ブランチ名は `<issue番号>-<短い英語名>`（例: `12-weight-table`）
  - PR の本文は `.github/pull_request_template.md` の形式で書き、`Closes #<サブissue番号>` を入れる
  - PR はサブ issue の範囲だけを扱う。範囲外の変更が必要になったら、別のサブ issue を提案する
- **各工程は skill で進める**（`/spec` → `/issues` → `/implement` → `/finish`）
- 土台づくりのステップ（ロードマップの「土台づくり」）は issue で管理しない。ブランチ名は内容がわかる短い英語名にする
- **main には直接 push できない**（保護されている）。すべての変更はブランチを作って PR にする
- **PR のマージは人が行う**（Squash merge）。AI はマージしない

### 品質

- **完了と報告する前に、lint と型チェックが通ることを確認する**（`pnpm lint` と `pnpm exec tsc --noEmit`）。通らないまま「完了」と言わない
- **構成を変えたら、同じ変更の中で docs も更新する**（[docs/README.md](docs/README.md) の書き方のルールに従う）

### 言語

- **返答もドキュメントも日本語で書く**

## Next.js について

@web/AGENTS.md
