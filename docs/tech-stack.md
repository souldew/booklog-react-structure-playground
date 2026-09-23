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
| スキーマ | zod (フォームの検証) | zod + `@hono/zod-openapi` |
| DB | — | SQLite (`node:sqlite`)。ORM なし |
| UI | shadcn/ui + Tailwind CSS | — |
| 状態 | React Context | — |
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
| 生成型の扱い | `apis/` の中だけで import する。`apis/functions/` が mapper を通してドメイン型で返し、Container 以降は生成型を知らない |
| 生成する対象 | 型と fetch クライアント。hook は生成しない (`client: "fetch"`) |
| HTTP クライアント | orval の `mutator` で差し替えた fetch。`web/src/shared/apis/customFetch.ts` |
| 設定 | `web/orval.config.ts`。`mode: tags-split` で tag ごとにファイルを分ける |
| hook を生成しない理由 | 取得も更新もサーバー (Server Component / Server Action) で行うため、ブラウザで呼ぶ hook に用が無い。`client: "react-query"` にすると全 GET に hook が生え、使わないものが増える |

### 生成したクライアントと通信経路の整合

通信経路は 3 種類ある（[backend.md §7](backend.md)）。生成した hook を書き換えずに
全部で使えるように、**mutator で base URL を切り替える**。

| 実行場所 | base URL | 到達先 |
|---|---|---|
| サーバー（Server Component / Server Action） | `API_BASE_URL` | `api` に直接 |
| ブラウザ、既定 | `NEXT_PUBLIC_API_BASE_URL` | `api` に直接。CORS を通る |
| ブラウザ、BFF を試す Container | `/api` | `web/app/api/` の Route Handler が `api` へ中継 |

mutator はサーバーかブラウザかを実行時に判定して上 2 つを選ぶ。
3 つ目は、その Container だけが生成された関数の `request` オプションで上書きする。

```ts
listBooks(params, { baseUrl: "/api" });
```

mutator は 4xx / 5xx を `ApiError` として throw する。生成型の union には 404 の分岐もあるが、
Server Component の error.tsx と Server Action の `catch` で受けるほうが素直なので、そちらに寄せる。

Route Handler はパスをそのまま `api` に渡すだけの中継にする。
OpenAPI 上のパスと BFF のパスが一致するので、生成したクライアントは 3 経路で共通になる。

### 生成型の境界は apis の出口

生成した型とクライアントを import してよいのは、views・features・entities の `apis/` の中だけ。
**境界は `apis/` の出口に引く。** `apis/functions/` が `apis/mappers/` を通して
ドメイン型に変換して返し、Container も Presentational も生成型を知らない。
サブディレクトリの役割は [directory-conventions.md](directory-conventions.md) の「apis の内側」にある。

```
generated/ の型・関数 ──> apis/functions ── apis/mappers ──> Container ──> Presentational
```

| 層 | 生成型 |
|---|---|
| `apis/functions/` | 触ってよい。mapper を呼ぶ場所 |
| `apis/mappers/` | 型だけ触る。純粋関数 |
| Container | **触らない。** `apis/` からドメイン型を受け取る |
| Presentational / Skeleton | **触らない。** props はドメイン型とフォームの値の型だけ |

Presentational が生成型を持たないのは、story で API の型を知らずに済ませるためと、
API スキーマの変更を mapper で止めるため。Container まで生成型を知らなくできるのは、
生成した関数を `apis/functions/` で包む層があるため。この層が無いと Container が生成関数を
直接呼ぶしかなく、境界を Presentational の手前まで後退させることになる。

---

## 4. 取得の経路: すべてサーバー

**取得は Server Component、更新は Server Action。** ブラウザから `api` を叩く経路は使わない。
クライアント取得のライブラリ (TanStack Query、SWR) は入れていない。

| 決めたこと | 内容 |
|---|---|
| 取得 | `apis/functions/` の `fetchXxx` を Server Component の Container から `await` する。`apis/hooks/` は作らない |
| 境界 | 画面の Container が `<Suspense fallback={<XxxSkeleton />}>` を置き、取得する Container をスロットに注入する。境界の位置は画面の都合なので、取得する側ではなく置く側が決める。画面ぶんを 1 回で取る `/dashboard` だけ、境界も画面単位で `loading.tsx` に置く |
| 並列 | 同じ境界の中で複数取るときは `Promise.all`。境界が分かれていれば、遅いほうが速いほうを待たせない |
| 取得の単位 | **エンドポイントの粒度が境界の粒度を決める。** 1 画面を 1 回で取るなら境界も 1 つで、そこに Skeleton を出す。細かく分けるほど早く出せる部分が増えるが、順に現れてレイアウトが動く (ポップコーン UI) |
| エラー | `apis/` が `ApiError` を throw し、ルートの `error.tsx` が受ける。`app/books/error.tsx` と `app/dashboard/error.tsx` にあり、`reset` で再試行する |
| 更新後 | Server Action の `revalidatePath` で、その更新が映る画面を再検証する。呼び忘れると古いまま残る ([backend.md §7](backend.md)) |

### クライアント取得を入れなかった理由

`/dashboard` は当初 TanStack Query で組んでいた。他の画面と同じ「パネルごとの境界」を
クライアント取得で作ると何が変わるかを比べるためだったが、次の順で畳んだ。

| 段階 | 分かったこと |
|---|---|
| クライアントだけで取る | `useSuspenseQuery` を SSR で動かすとサーバーとブラウザで 2 回取る。防ぐには prerender を止める部品が要り、HTML から中身が消える |
| prerender を止める | Next の SPA ガイドが挙げる形ではあるが、SSR を捨てる判断になる。この画面だけ HTML に中身が無くなる |
| サーバーで prefetch して `HydrationBoundary` で渡す | 二重取得は消え、HTML にも中身が入る。ただし Server Component で `await` するのと結果が変わらない |

最後の形まで来ると、TanStack Query が担っているのは「サーバーで取った値をブラウザのキャッシュに置く」ことだけになる。
このアプリはブラウザ側で再取得も楽観更新もせず、更新はすべて Server Action と `revalidatePath` で回るので、
そのキャッシュに用が無い。Provider・境界・`apis/hooks/`・生成 hook がまるごと不要になるため、外した。

**入れ直す条件**は、ブラウザだけで完結する取得が要るとき。
入力に応じた検索、ポーリング、無限スクロール、楽観更新のように、
サーバーへの往復で画面を作り直すのが重いものが出てきたら、その画面にだけ入れる。

## 5. フォーム

ライブラリを使わない。`<form action={serverAction}>` と `useActionState` で組む。

このデモでフォームが担う論点は
「作成と編集で Presentational を共有する」「`disabled` な input は送信されない」の 2 つで、
どちらもライブラリ無しのほうがそのまま見える。

| 決めたこと | 内容 |
|---|---|
| フォームの値の型 | view の `model.ts` に置く (`BookFormValues`)。入力欄の値は文字列のまま持ち、検証に落ちても入力したままの文字を再表示する。API の型 (`BookCreate` `BookUpdate`) は `apis/mappers/` で作る |
| Server Action の形 | `(state, formData) => Promise<state>`。`useActionState` がそのまま受ける。編集は `updateBook.bind(null, bookId)` で id を先に渡す |
| 状態 (`BookFormState`) | `values` `fieldErrors` `message`。成功時は `redirect` で抜けるので、この型が返るのは検証か通信に失敗したときだけ |
| 検証 | zod のスキーマ (`model.ts` の `BookFormSchema`) を Server Action の中の純粋関数 (`lib/parseBookForm.ts`) から使う。項目ごとのメッセージは `z.flattenError` で取り、最初の 1 つだけ出す。`<form noValidate>` でブラウザの制約検証は切る。切らないと `min` などで送信前に止まり、こちらのメッセージが出ない |
| 送信後の再表示 | React は action の後に form をリセットするので、入力欄の `defaultValue` は action が返した `values` から取り直す |
| `disabled` の扱い | 編集画面の状態 (`status`) は一覧のトグルで変えるので select を `disabled` にする。`disabled` な input は FormData に含まれないため、`parseBookForm` は無いことをエラーにせず「送られなかった」として返し、`toBookUpdate` は body から外す。API の PATCH は部分更新なので既存の値が保たれる |
| 成功後 | `revalidatePath` で一覧 (編集は詳細も) を再検証し、詳細へ `redirect` する。`redirect` は throw で抜けるので `try` の外に置く |

### ライブラリを入れるなら Conform

手書きで残っている定型は、`formData.get()` を集めて文字列に整える部分、zod のエラーを 1 項目 1 メッセージに潰す部分、
入力欄ごとの `defaultValue` `aria-invalid` `aria-describedby` の付け直し、`BookFormState` の自作の 4 つ。
フォームが増えてこれらが目立ってきたら、**Conform** (`@conform-to/react` + `@conform-to/zod`) を入れる。

| | 内容 |
|---|---|
| 選ぶ理由 | `useActionState` と Server Action を前提に作られている。`parseWithZod(formData, { schema })` で検証し、`submission.reply()` が `useActionState` に返す状態になる。`useForm` が項目ごとの `defaultValue` `errors` `aria` 属性をまとめて返す。同じスキーマでクライアント側の即時検証もできる |
| zod との関係 | Conform 自身は検証をしない。zod は残し、`@conform-to/zod/v4` のアダプタを挟む (1.21 の peer は `zod ^3.21 || ^4`)。増えるのは 2 パッケージ |
| 変わらないもの | `BookFormSchema`、`apis/mappers/`、Server Action の `revalidatePath` → `redirect` の流れ |
| 消えるもの | `lib/parseBookForm.ts` の大半、`BookForm` の項目ごとの属性の手書き、`BookFormState` (Conform の `SubmissionResult` に置き換わる) |
| 入れない理由 (いま) | 段階 2 の論点「`disabled` な input は送信されない」が `parseWithZod` の内側に隠れる。論点を手書きのコードで見せてから入れる |
| 入れ時 | 段階 3 (`book-note-form` `book-progress-form`) でフォームが 3 つになり、定型が 3 回並んだとき |

`zod-form-data` は FormData を文字列に整える部分だけを担う小さな代替だが、消える行数が少ないので Conform に行くか手書きのままかの二択にする。

### 段階 3 の時点 (判断待ち)

フォームは `BookForm` `BookNoteForm` `BookProgressForm` の 3 つになった。手書きで並んだ定型のうち、
ドメインを持たない部分は shared に出した。

| 定型 | いまの置き場 |
|---|---|
| ラベルとエラーの枠 | `shared/components/FormField/` (元 `BookForm/BookFormField.tsx`) |
| zod のエラーを 1 項目 1 メッセージに潰す | `shared/lib/fieldErrors.ts` の `firstFieldErrors` `hasFieldErrors` |
| 戻るリンク + 見出し + フォームの骨格 | `shared/layouts/FormPageLayout/` |
| `formData.get()` を集めて文字列に整える | 各 view の `lib/parseXxxForm.ts`。フォームごとに 10 行前後 |
| 入力欄ごとの `defaultValue` `aria-invalid` `aria-describedby` | 各 `XxxForm.tsx`。項目 1 つにつき 3 行 |
| `XxxFormValues` `XxxFormState` `XxxFormAction` の自作 | 各 view の `model.ts`。フォームごとに 20 行前後 |

Conform を入れると消えるのは下の 3 行で、上の 3 行は shared に出したので Conform でも残る (Conform は UI 部品を持たない)。
フォームごとの差 (`disabled` な status の引き継ぎ、`totalPages` を受けるスキーマ) は Conform でも `parseWithZod` に渡すスキーマ側に書く。

段階 5 の `/settings/profile` `/settings/notifications` で 5 つになる。入れるならそこが次の区切り。


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

msw に移る条件は、ブラウザで取得する部品を持ち込み、それを story やテストで動かすと決めたとき。
今は取得がすべてサーバーにあり、story に届くのはドメイン型の props だけなので、通信を偽装する場所が無い (§4)。
