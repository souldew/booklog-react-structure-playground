# バックエンド

Next.js とは別プロセスの API を立て、SQLite に永続化する。

---

## 1. なぜ分離するか

フロント側で確かめたい主張には、**API 境界が実在しないと検証できないもの**がいくつかある。
インメモリの固定データを view から直接読む形にすると、これらが全部消える。

| 主張 | 境界が無いと |
|---|---|
| Presentational は API の型ではなくフォームの値の型を持つ | API の型が存在しないので mapper に仕事が無い |
| API スキーマの変更は mapper で止まる | 変更が起きようが無い |
| `revalidatePath` を呼び忘れると更新後に一覧が古いまま | 実際に古くならないので再現できない |
| `disabled` な input は送信されず、値が壊れることがある | 送信先が無いので壊れない |
| 一覧のインライン更新は行単位で pending / error を持つ | 失敗しないので状態が要らない |

**主張の検証が目的なので、境界は本物にする。** 永続化は、更新が次のリクエストに
反映されることを見せるために要る。

---

## 2. 構成

1リポジトリに pnpm workspace で 2 つ置く。

```
booklog-react-structure-playground/
├── pnpm-workspace.yaml   packages: ["web", "api"]
├── package.json          スクリプトのみ。依存は各パッケージが持つ
├── docs/
├── web/                  Next.js。画面
└── api/                  Hono。API と DB
```

npm と違い、**ワークスペースの定義は `package.json` の `workspaces` ではなく
`pnpm-workspace.yaml`** に書く。

| | 技術 | ポート |
|---|---|---|
| `web` | Next.js (App Router) | 3000 |
| `api` | Hono (Node) | 8787 |

`api` を Hono にするのは、ルーティングと zod によるバリデーションが薄く書けて、
**OpenAPI を出力できる**ため。デモの主眼は API の実装ではないので、
フレームワーク側の学習コストは小さいほうがよい。

---

## 3. データベース

`node:sqlite` を使う。**Node 26 に同梱されていて追加依存が要らない。**

ORM は入れない。テーブルが 5 つで、クエリも単純なため。
スキーマ駆動で型が欲しくなったら Drizzle を検討する。

```
api/
├── db/
│   ├── schema.sql        テーブル定義
│   ├── seed.ts           初期データ
│   ├── client.ts         DatabaseSync のインスタンス。getDb() で遅延して開く
│   └── reset.ts          pnpm db:reset の実体
├── src/
│   ├── index.ts          serve
│   ├── app.ts            middleware とルートの結線、/doc
│   ├── openapi.ts        pnpm openapi の実体
│   ├── schemas.ts        zod スキーマ
│   ├── routes/           1 リソース 1 ファイル
│   ├── middleware/       delay と fail
│   └── lib/
├── openapi.yaml          生成物。git 管理する
└── booklog.db            git 管理外
```

`booklog.db` が無い状態で最初に DB へアクセスすると、スキーマ作成とシード投入を自動で行う。
`pnpm dev` だけで動く状態にするため。`getDb()` を import 時ではなく呼び出し時に開くのは、
`pnpm openapi` が DB を必要としないため。

| テーブル | 主キー | 備考 |
|---|---|---|
| `books` | `id` | |
| `book_progress` | `book_id` | **books と 1:1。独自の id を持たない** |
| `book_notes` | `id` | books と 1:N |
| `profile_settings` | 単一行 | |
| `notification_settings` | 単一行 | |

`book_progress` が `book_id` を主キーに持つことが、
**URL 側で `/books/[bookId]/progress` に `[id]` が付かない理由**と一致する。
単一リソースであることがテーブル定義に出ている状態にしておく。

`pnpm db:reset` でスキーマ再作成とシード投入をやり直せるようにする。

---

## 4. エンドポイント

画面の URL とは別物だが、REST の規則は同じものを使う。

| メソッド | パス | 対応 |
|---|---|---|
| `GET` | `/books` | 一覧。`?status=` `?keyword=` で絞り込む |
| `POST` | `/books` | 作成 |
| `GET` | `/books/:bookId` | 詳細 |
| `PATCH` | `/books/:bookId` | 更新。一覧のトグルもここを叩く |
| `GET` | `/books/:bookId/notes` | メモ一覧 |
| `POST` | `/books/:bookId/notes` | メモ作成 |
| `PATCH` | `/books/:bookId/notes/:noteId` | メモ更新 |
| `DELETE` | `/books/:bookId/notes/:noteId` | メモ削除 |
| `GET` | `/books/:bookId/progress` | 進捗。**`:id` を持たない** |
| `PUT` | `/books/:bookId/progress` | 進捗更新 |
| `GET` | `/settings/profile` | |
| `PUT` | `/settings/profile` | |
| `GET` | `/settings/notifications` | |
| `PUT` | `/settings/notifications` | |
| `GET` | `/dashboard` | ダッシュボード 1 画面ぶん。読書中の本と進捗・最近のメモ・月別の統計 |

`notes` に `:noteId` が付き `progress` に付かないのが、
コレクションと単一リソースの違いがそのまま出ている箇所。

### レスポンスの形は DB に寄せる

レスポンスのフィールド名は DB の列名と同じ **snake_case** にし、`id` は **整数**のまま返す。
`web` 側のドメイン型は camelCase で `id` は `string` なので、mapper に
`total_pages → totalPages`、`id: number → string` という実体のある変換ができる。
API と画面の型が最初から一致していると、mapper が素通しになって境界の意味が見えない。

enum の値も同じ理由で snake_case にしてある。`status` の `on_hold` は生成側でも
`BookStatus.on_hold` のままで、ドメインの `onHold` との対応表を mapper が持つ。
対応表に `satisfies Record<生成型, ドメイン型>` を付けておくと、API に値が増えたときに抜けがコンパイルエラーになる。

バリデーションに失敗したリクエストは 400 で `{ message, issues }` を返す。
存在しない本やメモは 404 で `{ message }` を返す。

### ダッシュボードは 1 画面ぶんをまとめて返す

`/dashboard` はリソースではなく**画面**に紐づくエンドポイントで、パスもそのまま画面名にしてある。
REST のリソースに見せかけた名前 (`/summary` など) を付けると、画面が変われば形も変わるものを
リソースのふりをさせることになる。

パネルごとにエンドポイントを分けた形 (`/stats/monthly` `/notes/recent` + 本ごとの進捗) から移した。
分けたままだと次の 2 つが起きる。

| | |
|---|---|
| N+1 | 「読書中の本」は本の一覧を取ってから **1 冊ごとに** `/books/:bookId/progress` を叩くことになる。まとめて取る口が無い |
| ポップコーン UI | パネルが別々のタイミングで現れ、そのたびにレイアウトが動く |

読書中の本と進捗は `books JOIN book_progress` の 1 クエリで組にして返す。
`ReadingBook` (本と進捗の組) は API 側のスキーマにも現れ、web の `views/dashboard` が
同じ名前のドメイン型で受ける。

**画面単位より細かくは分けない。** 分ける単位を「パネル」にすると、
画面の見た目を変えるたびにエンドポイントの数が動く。

---

## 5. 遅延とエラー

人工的な遅延は **`api` 側の middleware に置く。** フロントに遅延処理を書かない。

| エンドポイント | 遅延 |
|---|---|
| `/books` | 1200ms |
| `/books/:bookId` | 400ms |
| `/dashboard` | 1200ms |
| その他 | 200ms |

`/dashboard` は 1 画面ぶんをまとめて返すので、一番重い `/books` に合わせてある。
画面全体が 1.2 秒待って一度に出るので、ポップコーン UI と引き換えに何を払っているかが見える。
`/doc` には遅延を入れない。`API_DELAY=0` を付けて起動すると全部の遅延を止められる。
curl での確認やスクリプトから叩くときに使う。

エラー表示を確認するために、`?fail=1` を付けたリクエストは 500 を返す。
特定の id だけ必ず失敗する、といった仕掛けは入れない。

---

## 6. 型の受け渡し

`@hono/zod-openapi` で OpenAPI を出力し、**`web` 側で型を生成する。**

```
api/  zod スキーマ  →  openapi.yaml  →  web/src/generated/
```

| 段階 | 成果物 |
|---|---|
| `api` のルート定義 | zod スキーマ（`api/src/schemas.ts`） |
| `pnpm --filter api openapi` | `api/openapi.yaml` |
| `pnpm --filter web codegen` | `web/src/generated/`。orval が型とエンドポイントごとの fetch 関数を生成 |

ルートの `pnpm openapi` が 2 つを続けて実行する。生成の設定は [tech-stack.md §3](tech-stack.md) にある。

生成した型を **`apis/` の外に出さない。** `apis/functions/` が `apis/mappers/` を通し、
生成型からドメイン型・フォームの値の型へ変換してから返す。この境界を持つことが目的なので、
省略すると分離した意味が無くなる。生成型を import するのは `apis/` の中だけ。

```
生成型 ──> apis/functions ── apis/mappers ──> ドメイン型 ──> Container ──> Presentational
```

### Hono RPC を使わない理由

Hono には `hc` による型付きクライアントがあり、コード生成なしに型が繋がる。
書き味は良いが、**API の型がそのままフロントまで流れてくる**ので、
mapper と型の境界という論点が消える。

実務で OpenAPI からコードを生成する構成を前提にしているため、
ここでは生成を挟む形にそろえる。

---

## 7. 通信経路

取得は Server Component、更新は Server Action。**`api` を叩くのはサーバーだけ**で、
ブラウザから叩く画面は持たない ([tech-stack.md §4](tech-stack.md))。

| 経路 | 用途 |
|---|---|
| Server Component → `api` | 画面の取得 |
| Server Action → `api` | 作成・更新・削除 |

**経路が 1 種類しかないので、その前提に乗ったものは持たない。**
mutator の base URL は `API_BASE_URL` の 1 つだけで、`api` に CORS の設定は無く、
`web/app/api/` の Route Handler も置いていない。

ブラウザから叩く画面が要るようになったら、`api` を直接叩く形と `web/app/api/` の Route Handler を
挟む形 (BFF) のどちらかを選ぶ。直接叩く形はブラウザに `api` の URL が露出して CORS の設定が要り、
BFF を挟む形は `web` 側に中継のコードが増える。どちらも必要になった時点で足す。

更新後は Server Action の中で `revalidatePath` を呼ぶ。
**呼び忘れると一覧が古いまま残る**ので、その状態も含めて確認できる。
本の更新は `/books` と `/books/[bookId]` だけでなく `/dashboard` にも映るので、
1 つの更新で再検証するパスは複数になる。

---

## 8. 起動

```bash
pnpm dev             # web と api を同時に起動
pnpm --filter web dev
pnpm --filter api dev
pnpm db:reset        # スキーマ再作成とシード投入
pnpm openapi         # openapi.yaml の出力と web 側の型生成
```

ルートの `dev` は `pnpm -r --parallel dev` にする。
**pnpm が並列実行を持っているので `concurrently` を足さない。**

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "db:reset": "pnpm --filter api db:reset",
    "openapi": "pnpm --filter api openapi && pnpm --filter web codegen"
  }
}
```

`web` は `API_BASE_URL` で `api` を参照する。`web/.env.local` に置き、
`web/.env.example` をコピーすればローカルの既定値になる。
未設定のときは `http://localhost:8787` に落ちる。
