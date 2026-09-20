# バックエンド

Next.js とは別プロセスの API を立て、SQLite に永続化する。

---

## 1. なぜ分離するか

フロントの指針には、**API 境界が実在しないと検証できない主張**がいくつかある。
インメモリの固定データを features から直接読む形にすると、これらが全部消える。

| 指針の主張 | 境界が無いと |
|---|---|
| Presentational は API の型ではなくフォームの値の型を持つ | API の型が存在しないので mapper に仕事が無い |
| API スキーマの変更は mapper で止まる | 変更が起きようが無い |
| query key を共有しないと更新後に一覧が古いまま | 実際に古くならないので再現できない |
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

ORM は入れない。テーブルが3つで、クエリも単純なため。
スキーマ駆動で型が欲しくなったら Drizzle を検討する。

```
api/
├── db/
│   ├── schema.sql        テーブル定義
│   ├── seed.ts           初期データ
│   └── client.ts         DatabaseSync のインスタンス
└── booklog.db            git 管理外
```

| テーブル | 主キー | 備考 |
|---|---|---|
| `books` | `id` | |
| `reading_progress` | `book_id` | **books と 1:1。独自の id を持たない** |
| `book_notes` | `id` | books と 1:N |
| `profile_settings` | 単一行 | |
| `notification_settings` | 単一行 | |

`reading_progress` が `book_id` を主キーに持つことが、
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
| `GET` | `/stats/monthly` | ダッシュボード用。冊数・ページ数 |
| `GET` | `/notes/recent` | ダッシュボード用。本を横断した最近のメモ |

`notes` に `:noteId` が付き `progress` に付かないのが、
コレクションと単一リソースの違いがそのまま出ている箇所。

### ダッシュボードに集約エンドポイントを作らない

`GET /dashboard` を作ると1回の待ちにまとまってしまい、
**パネルごとに Suspense 境界を分ける意味が消える。**

パネルごとに別のエンドポイントを叩き、それぞれ異なる遅延を持たせることで、
速いパネルから順に出てくる様子を見せる。

---

## 5. 遅延とエラー

人工的な遅延は **`api` 側の middleware に置く。** フロントに遅延処理を書かない。

| エンドポイント | 遅延 |
|---|---|
| `/books` | 1200ms |
| `/books/:bookId` | 400ms |
| `/stats/monthly` | 300ms |
| `/notes/recent` | 1500ms |
| その他 | 200ms |

ダッシュボードのパネルが別々のタイミングで出るように、意図的にばらしてある。

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
| `api` のルート定義 | zod スキーマ |
| `pnpm openapi` | `openapi.yaml` |
| `web` の生成 | `web/src/generated/` |

生成した型を **features から直接 import しない。** `web` 側に mapper を置き、
生成型からドメイン型・フォームの値の型へ変換する。この境界を持つことが目的なので、
省略すると分離した意味が無くなる。

```
生成型 ── mapper ──> ドメイン型 ──> Presentational
```

### Hono RPC を使わない理由

Hono には `hc` による型付きクライアントがあり、コード生成なしに型が繋がる。
書き味は良いが、**API の型がそのままフロントまで流れてくる**ので、
mapper と型の境界という論点が消える。

実務で OpenAPI からコードを生成する構成を前提にしているため、
ここでは生成を挟む形にそろえる。

---

## 7. 通信経路

**ブラウザから `api` を直接叩かない。** Server Component と Server Action からだけ
呼ぶことで、CORS の設定が要らなくなる。

| 経路 | 用途 |
|---|---|
| Server Component → `api` | 画面の取得 |
| Server Action → `api` | 作成・更新・削除 |
| Client Component → `web/app/api/` → `api` | クライアント取得を試す画面だけ |

3つ目は Route Handler を BFF として挟む形。クライアント取得と
`XxxClientContainer` の構成を試すときにだけ使い、既定の経路にはしない。

更新後は Server Action の中で `revalidatePath` を呼ぶ。
**呼び忘れると一覧が古いまま残る**ので、その状態も含めて確認できる。

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

`web` は `API_BASE_URL` で `api` を参照する。`web/.env.local` に置く。
