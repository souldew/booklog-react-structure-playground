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
| `*.test.ts` | node（Vitest の unit project） | `apis/mappers/` と `lib/` の純粋関数。`apis/functions/` は `fetch` をスタブして通信の手前まで動かす (後述) |

msw は入れない。story は Presentational で完結させ、通信をモックしない。
Storybook は `web` にだけ置く。`api` は Vitest のみ。

| 決めたこと | 内容 |
|---|---|
| Storybook の framework | `@storybook/nextjs-vite`。`next/link` `next/font` `next/navigation` を Storybook 側で差し替えてくれる |
| addon | `@storybook/addon-docs` と `@storybook/addon-vitest` だけ。Chromatic は使わない |
| Vitest の版 | **4 系に固定する。** `@storybook/addon-vitest` 10.6 の peer が `vitest ^3 || ^4` で、5 系を受け付けない |
| 設定ファイル | `web/vitest.config.mts`。`web/package.json` は `"type": "module"` ではないので、`.ts` だと Vite が CJS として読んで警告を出す |
| project | `unit` (node、`src/**/*.test.ts`) と `storybook` (Playwright の chromium、headless) の 2 つ |
| `@/` の解決 | `vitest.config.mts` の `resolve.alias` で `src/` に向ける。storybook project は framework が tsconfig の paths を読むが、unit project には効かないため |
| story の実行 | `pnpm test` で unit と story を両方回す。ブラウザで見るときは `pnpm storybook` |
| 差し替え | props で受け取る関数は `storybook/test` の `fn()` を渡す。戻り値の型が union のときは `fn(async (): Promise<ActionResult> => ...)` のように注釈する |
| Page のスロット | 取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。`experimentalRSC` も使わない |
| Skeleton からの切り替わり | ツールバーの「スロットの遅延」(なし / 800ms / 2s)。Page の story が `parameters.slots` に「スロット名 → Skeleton」を宣言すると、選んだ遅延の間だけ Skeleton を出してから中身に切り替わる。実装は `web/.storybook/slotDelay.tsx` |
| レイアウトシフトの検査 | `shared/fixtures/expectStable.ts`。story に `globals: { slotDelay: 800 }` を付け、play で「下にある要素の上端が切り替わりの前後で動かない」ことを検査する |

### Skeleton からの切り替わりを story で見る

Skeleton と中身を別々の静止画として持つだけでは、切り替わりの瞬間 (レイアウトシフト) が見えない。
そこで `.storybook/slotDelay.tsx` に decorator を置き、`parameters.slots` を持つ story のスロットを
「指定ミリ秒の間 fallback を出し、その後 children に切り替える」部品 (`Delayed`) で包む。

```tsx
// Page の story 側はこれだけ
parameters: { slots: { rows: <BookRowsSkeleton /> } },
```

`Delayed` は内側で Suspense と `use()` を使う。Promise は Suspense 境界の外で持つ。境界の内側は初回に
suspend すると丸ごと捨てられて作り直されるので、内側で作ると毎回新しい Promise になって解決しない。

`Delayed` は decorator だけが使うので `.storybook/` に閉じ、`src/` には置かない。story が import する道具
(`expectStable`) は `shared/fixtures/` に置く。

本物の Container と Suspense を story に載せる `experimentalRSC` は使わない。Container の story を書かないという
規則を崩す上に、名前どおり experimental であるため。

### apis/functions のテストは fetch をスタブする

`apis/functions/` の関数は「生成クライアントを呼ぶ → status で分岐 → mapper → 例外の翻訳 → 副作用」の配線で、
確かめたいのは **web が境界に何を出し、何が返ったときにどう振る舞うか**。生成クライアントを `vi.mock` すると
URL・メソッド・body が見えなくなるので、その手前の `fetch` を差し替え、生成クライアント → mutator → mapper を通しで動かす。

| 決めたこと | 内容 |
|---|---|
| 差し替え方 | `shared/fixtures/stubFetch.ts`。`vi.stubGlobal("fetch", ...)` で global の `fetch` を置き換える。解除は unit project の `unstubGlobals: true` が毎テスト後に行う |
| 応答の指定 | 配列で渡し、`fetch` が呼ばれた順に先頭から返す。URL やメソッドでは振り分けない。使い切ったら例外で止める |
| 送った内容 | 戻り値の配列に、呼ばれた順のメソッド・パス・JSON の body が記録される。パスは base URL を除いた `pathname` |
| 応答の body | 生成型 (`@/generated/model`) を付けて手で書く。テストは `apis/` の中にあるので生成型を import してよい |
| `next/cache` | `revalidatePath` はリクエストの外で呼ぶと Next が例外を投げるので `vi.mock("next/cache")` する。`"use server"` は Vitest では文字列に過ぎない |

順番でしか振り分けないのは、`functions/` が「1 エンドポイント 1 ファイル」で、1 関数の通信が必ず 1 回だから。
複数のエンドポイントの合成は関数の中で `Promise.all` せず、Container 側で関数を並べて呼ぶ。
Container はテストしないので、複数リクエストをスタブする場面が生まれない。

#### 担保しているものと、していないもの

| 担保している | 手段 |
|---|---|
| 送るメソッド・パス (パスパラメータの埋め込みを含む)・body の JSON 化 | スタブの記録 |
| status の分岐。200 は mapper へ、404 の `ApiError` は `undefined`、それ以外はそのまま投げる | 応答の status |
| 副作用。成功時だけ `revalidatePath`、失敗は throw せず `{ ok: false, message }` で返す | `vi.mock` した `revalidatePath` の呼び出し記録 |
| mapper を含む配線が実行時に通ること | 戻り値の `id` と `status` を 1 つ見る |

mapper の変換の正しさは `apis/mappers/` のテストの仕事で、関数のテストでは見ない。「mapper を呼んでいるか」も、
生成型とドメイン型の `id` (`number` と `string`) や `status` (`on_hold` と `onHold`) が食い違っている限り tsc が保証するので、
関数のテストの assert は配線が通る 1 本で足りる。

| 担保していない | 埋めるなら |
|---|---|
| api がそのパスと body を受け付け、その形で返すこと。スタブは何でも受ける | `api` 側に `app.request()` のテストを置き、`openapi.yaml` を挟んで両側から閉じる |
| `API_BASE_URL` の分岐。スタブはホストを見ない | 必要になったら `resolveBaseUrl` を切り出して単体で見る |
| Container の `notFound()` や Server Action の受け渡し | 方針として書かない。ブラウザで確認する |

#### msw を使わない理由

一度 orval の `output.mock` で msw の handler を生成する形を試し、スタブに戻した。

- 生成された handler は status が 200 に固定で、`override` は body しか差し替えられない。404 や 500 は素の `http.get(...)` を手で書くことになり、9 テスト中 4 つが手書きだった。正常系 5 つの 1 行ずつしか省けていない
- 4 関数・9 テストの規模では、msw と `@faker-js/faker` の依存、生成物 6 ファイル、`setupServer` の起動と後始末が見合わない
- 1 関数 1 通信の規則があるので、msw の強みであるパスでの振り分けを使う場面がない

msw に移る条件は、`apis/hooks/` を単体テストすると決めたとき。TanStack Query は 1 テストで複数のパスに再取得を飛ばすので、
順番のキューでは読めなくなる。その時点で hooks 用の jsdom project と合わせて入れる。hooks をテストしないと決めるなら、この先も要らない。
