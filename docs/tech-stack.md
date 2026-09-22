# 技術選定

このリポジトリで使う技術の一覧。理由が構成に関わるものは [backend.md](backend.md) にあり、
ここでは**何を使うか**と、その選定の理由だけを書く。

---

## 1. ツールチェーン

版は `mise.toml` で固定する。グローバルの版とは独立させる。

| ツール | 版 | 備考 |
|---|---|---|
| Node | 26.9.0 | `node:sqlite` を追加依存なしで使うため |
| pnpm | 10.26.0 | workspace の管理 |

---

## 2. パッケージ別

| | `web` | `api` |
|---|---|---|
| フレームワーク | Next.js (App Router) | Hono (Node) |
| 言語 | TypeScript | TypeScript |
| スキーマ | — | zod + `@hono/zod-openapi` |
| DB | — | SQLite (`node:sqlite`)。ORM なし |
| UI | shadcn/ui + Tailwind CSS | — |
| 状態 | React Context | — |
| クライアント取得 | TanStack Query | — |
| 型生成 | orval | OpenAPI の出力元 |
| フォーム | ライブラリを使わない | — |
| story | Storybook | — |
| テスト | Vitest | Vitest |

---

## 3. 型生成: orval

`api` が出す `openapi.yaml` から `web/src/generated/` に生成する。

| 決めたこと | 内容 |
|---|---|
| 生成物の置き場 | `web/src/generated/`。git 管理外にはしない |
| 生成型の扱い | `apis/` の中だけで import する。`apis/functions/` と `apis/hooks/` が mapper を通してドメイン型で返し、Container 以降は生成型を知らない |
| 生成する対象 | 型・fetch クライアント・TanStack Query の hook |
| HTTP クライアント | orval の `mutator` で差し替えた fetch。`web/src/shared/apis/customFetch.ts` |
| 設定 | `web/orval.config.ts`。`mode: tags-split` で tag ごとにファイルを分ける |
| hook の生成 | orval の既定に任せる。GET が `useQuery`、それ以外が `useMutation` |

`override.query` の `useQuery` / `useMutation` を明示的に `true` にすると、
全メソッドに両方の hook が生えて GET に `useMutation` が付く。既定のままにしておく。

### 生成した hook と通信経路の整合

通信経路は 3 種類ある（[backend.md §7](backend.md)）。生成した hook を書き換えずに
全部で使えるように、**mutator で base URL を切り替える**。

| 実行場所 | base URL | 到達先 |
|---|---|---|
| サーバー（Server Component / Server Action） | `API_BASE_URL` | `api` に直接 |
| ブラウザ、既定 | `NEXT_PUBLIC_API_BASE_URL` | `api` に直接。CORS を通る |
| ブラウザ、BFF を試す Container | `/api` | `web/app/api/` の Route Handler が `api` へ中継 |

mutator はサーバーかブラウザかを実行時に判定して上 2 つを選ぶ。
3 つ目は、その Container だけが生成された hook の `request` オプションで上書きする。

```ts
useListBooks(params, { request: { baseUrl: "/api" } });
```

mutator は 4xx / 5xx を `ApiError` として throw する。生成型の union には 404 の分岐もあるが、
TanStack Query の `isError` と Server Action の `catch` で受けるほうが素直なので、そちらに寄せる。

Route Handler はパスをそのまま `api` に渡すだけの中継にする。
OpenAPI 上のパスと BFF のパスが一致するので、生成した hook は 3 経路で共通になる。

### 生成型の境界は apis の出口

生成した型と hook を import してよいのは、views や features の `apis/` の中だけ。
**境界は `apis/` の出口に引く。** `apis/functions/` と `apis/hooks/` が `apis/mappers/` を通して
ドメイン型に変換して返し、Container も Presentational も生成型を知らない。
サブディレクトリの役割は [directory-conventions.md](directory-conventions.md) の「apis の内側」にある。

```
generated/ の型・hook ──> apis/functions ── apis/mappers ──> Container ──> Presentational
generated/ の hook    ──> apis/hooks     ── apis/mappers ──> ClientContainer ──> Presentational
```

| 層 | 生成型 |
|---|---|
| `apis/functions/` `apis/hooks/` | 触ってよい。mapper を呼ぶ場所 |
| `apis/mappers/` | 型だけ触る。純粋関数 |
| Container / ClientContainer | **触らない。** `apis/` からドメイン型を受け取る |
| Presentational / Skeleton | **触らない。** props はドメイン型とフォームの値の型だけ |

Presentational が生成型を持たないのは、story で API の型を知らずに済ませるためと、
API スキーマの変更を mapper で止めるため。Container まで生成型を知らなくできるのは、
生成 hook を `apis/hooks/` で包む層があるため。この層が無いと ClientContainer が生成 hook を
直接呼ぶしかなく、境界を Presentational の手前まで後退させることになる。

---

## 4. クライアント取得: TanStack Query

`XxxClientContainer` からの取得・更新にだけ使う。既定の経路は Server Component と
Server Action なので、**QueryClientProvider は必要になった画面の層でマウントする**。
アプリ全体には置かない。

---

## 5. フォーム

ライブラリを使わない。`<form action={serverAction}>` と `useActionState` で組む。

このデモでフォームが担う論点は
「作成と編集で Presentational を共有する」「`disabled` な input は送信されない」の 2 つで、
どちらもライブラリ無しのほうがそのまま見える。

---

## 6. lint / formatter

| 役割 | ツール |
|---|---|
| lint | oxlint |
| formatter | oxfmt |

ESLint / Prettier / Biome は入れない。設定はリポジトリ直下に 1 つ置き、`web` と `api` で共有する。

---

## 7. story とテスト

Storybook と Vitest を採用する。[directory-conventions.md](directory-conventions.md) のとおり実装とコロケーションする。

| 対象 | 動かす場所 | 書くもの |
|---|---|---|
| story | browser（Vitest の storybook project） | Presentational と Skeleton だけ。Container は書かない |
| `*.test.ts` | node | `apis/mappers/` と `lib/` の純粋関数 |

msw は入れない。story は Presentational で完結させ、通信をモックしない。
Storybook は `web` にだけ置く。`api` は Vitest のみ。
