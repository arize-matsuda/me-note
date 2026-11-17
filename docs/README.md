# ドキュメント

me-note のドキュメントの目次。作業を始める前に、関係するものを読む。

| ドキュメント | 内容 | いつ読むか |
|---|---|---|
| [product.md](product.md) | 何を・なぜ作るか、大事にすること、ロードマップ | 機能を追加するか迷ったとき |
| [architecture.md](architecture.md) | 現在の構成、守るルール、ディレクトリ | コードを書く前 |
| [decisions/](decisions/) | なぜそう決めたか（決定の記録） | 方針の理由を知りたいとき、方針を変えたいとき |
| [features/](features/) | 機能ごとの仕様 | その機能を作る・直すとき |

## 機能づくりの流れ

1つの機能を親 issue、タスクをサブ issue で管理し、各工程を skill で進める（[decisions/0006](decisions/0006-issue-workflow.md)）。

| 工程 | skill | 人がすること |
|---|---|---|
| 仕様 | `/spec <機能名>` | 仕様を確認・承認する |
| issue 作成 | `/issues <機能名>` | 親 issue とサブ issue の案を承認する |
| 実装 | `/implement <サブissue番号>` | 計画を承認し、PR を確認してマージする（サブ issue の数だけ繰り返す） |
| 完了 | `/finish <親issue番号>` | 受け入れ条件を確認し、PR をマージする |

skill の中身は `.claude/skills/` にある。

## 決定の記録（decisions）

| # | 内容 |
|---|---|
| [0001](decisions/0001-users-and-devices.md) | 利用者と利用端末 |
| [0002](decisions/0002-repository-structure.md) | リポジトリ構成と役割分担 |
| [0003](decisions/0003-hosting-database-auth.md) | 公開先・データベース・ログイン |
| [0004](decisions/0004-first-feature-weight.md) | 最初に作る記録は体重・体脂肪率 |
| [0005](decisions/0005-development-process.md) | 開発の進め方 |
| [0006](decisions/0006-issue-workflow.md) | issue による機能とタスクの管理 |
| [0007](decisions/0007-branch-and-pr.md) | ブランチと PR の運用 |
| [0008](decisions/0008-ci.md) | CI で lint と型チェックを自動実行する |

## 書き方のルール

- 日本語で書く
- **同じ内容を2か所に書かない**。ほかのドキュメントにある内容はリンクで参照する
  - 「今どうなっているか」→ `architecture.md`
  - 「なぜそう決めたか」→ `decisions/`
- 構成を変えたら、同じ変更の中で `architecture.md` も更新する
- 方針を変えるときは、既存の決定を書き換えず、新しい決定を追加する。古い決定の状態は「置き換え済み（00XX）」にする
- 決定の記録は `decisions/NNNN-英語の短い名前.md` の形で、連番で追加する
- 機能の仕様は [features/_template.md](features/_template.md) をコピーして作る
