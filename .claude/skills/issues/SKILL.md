---
name: issues
description: me-note の確認済みの機能仕様から、親 issue とサブ issue（タスク）の案を作り、承認後に GitHub に作成する。機能づくりの2番目の工程。
argument-hint: <機能名 または docs/features/ のファイル名>（例: weight）
disable-model-invocation: true
---

# /issues — 親 issue とサブ issue を作る

機能づくりの2番目の工程。確認済みの仕様をもとに、機能を親 issue、タスクをサブ issue として GitHub に作成する。
流れの全体は `docs/decisions/0006-issue-workflow.md`。

対象の機能: $ARGUMENTS

## この skill でやらないこと

- 承認を得る前に issue を作らない
- 仕様を変えない。仕様に問題が見つかったら、作業を止めて `/spec` で直すよう提案する
- ブランチを作らない、コードを書かない（次の工程 `/implement` で行う）

## 手順

### 1. 準備

1. 対象の機能が指定されていなければ、どの機能か質問して止まる
2. `docs/features/<機能名>.md` を読む
   - ファイルがない → `/spec` を先に実行するよう伝えて止まる
   - 状態が `確認済み` でない → 仕様の確認を先に済ませるよう伝えて止まる
3. `docs/architecture.md` と `.github/ISSUE_TEMPLATE/` の2つのテンプレートを読む
4. 同じ機能の親 issue がすでにないか確認する
   ```bash
   gh issue list --state all --search "<機能名> in:title"
   ```
   あれば番号と状態を示し、どうするか質問して止まる

### 2. タスクに分ける

仕様を、サブ issue（タスク）に分ける。

- **1つのサブ issue は1つの PR で終わる大きさ** にする。人が PR を無理なく確認できる大きさを目安にする
- 基本の順番は「データ（DB テーブル）→ 保存・取得の処理 → 画面 → グラフ・集計」。前のタスクが終わらないと始められないものは、依存関係を明記する
- 仕様の受け入れ条件が、どれかのサブ issue の完了条件に必ず含まれるようにする
- 仕様の「今回はやらないこと」をタスクにしない
- 土台づくりで未完了のもの（DB、ログインなど）が必要な場合は、タスクにせず人に知らせる（土台づくりは issue で管理しないため）

### 3. 案を示して承認を得る

親 issue とすべてのサブ issue の案を、作成前に **まとめて** 示す。

- 親 issue: `.github/ISSUE_TEMPLATE/feature.md` の形式。タイトルは `[機能] <機能名>`
- サブ issue: `.github/ISSUE_TEMPLATE/task.md` の形式。タイトルは `[タスク] <やること>`
- サブ issue は実行する順に並べ、依存関係を示す
- 案を一覧で示したあと、承認・修正を求めて **止まる**。修正があれば反映し、もう一度示す

### 4. GitHub に作成する

承認されたら作成する。本文はテンプレートの形式で書き、`--body-file` で渡す（テンプレートの先頭の `---` で囲まれた部分は本文に含めない）。

1. 親 issue を作る
   ```bash
   gh issue create --title "[機能] <機能名>" --body-file <本文のファイル>
   ```
2. サブ issue を順番に作る。本文の「親 issue」欄に親 issue の番号を書く
   ```bash
   gh issue create --title "[タスク] <やること>" --body-file <本文のファイル>
   ```
3. 各サブ issue を親 issue に紐づける。API には issue 番号ではなく issue の ID を渡す
   ```bash
   id=$(gh api repos/{owner}/{repo}/issues/<サブissue番号> --jq .id)
   gh api -X POST repos/{owner}/{repo}/issues/<親issue番号>/sub_issues -F sub_issue_id="$id"
   ```
4. 紐づけを確認する
   ```bash
   gh api repos/{owner}/{repo}/issues/<親issue番号>/sub_issues --jq '.[] | "#\(.number) \(.title)"'
   ```
   本文の一時ファイルはスクラッチパッドに置き、リポジトリには残さない。

途中で失敗したら、そこで止めて、作成済みの issue と失敗した操作を示す。勝手に作り直さない。

### 5. 終わり

- 作成した親 issue とサブ issue の番号・タイトル・URL を一覧で示す
- 次の工程は `/implement <最初のサブissue番号>` であることを伝える
