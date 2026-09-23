# プロジェクトの初期化

2026-09-22 に実行した手順。叩いたコマンドを順番どおりに残す。
版は [mise.toml](../mise.toml) で固定した Node 26.9.0 と pnpm 10.26.0。

---

## 1. workspace のルート

```bash
pnpm init
```

生成された `package.json` を手で書き換え、`private: true` とスクリプトだけにした。
依存は各パッケージが持ち、ルートには lint / formatter だけを置く。

`pnpm-workspace.yaml` は手で作成した。

```yaml
packages:
  - web
  - api

onlyBuiltDependencies:
  - esbuild
```

`onlyBuiltDependencies` は create-hono が `api/pnpm-workspace.yaml` に書いたものをルートへ移した。

---

## 2. `web`（Next.js）

```bash
pnpm dlx create-next-app@latest web --ts --tailwind --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --skip-install --yes
```

`--skip-install` にしたのは、`api` の生成と並行して 2 つの `pnpm install` が
ルートの lockfile を取り合わないようにするため。

### 生成後に消したもの

| ファイル | 理由 |
|---|---|
| `web/eslint.config.mjs` | linter は oxlint。`--yes` の既定で ESLint が選ばれた |
| `web/pnpm-workspace.yaml` | 入れ子の workspace になり、ルートの workspace が壊れる |
| `web/.gitignore` | ルートの `.gitignore` に同じ内容がある |

`web/package.json` からも ESLint の依存と `lint` スクリプトを消し、
`@types/node` を `^26` に上げ、`packageManager` をルートに任せて消した。

`web/AGENTS.md` と `web/CLAUDE.md` は create-next-app が生成したもの。
`next dev` が再生成するので、消さずにコミットする。

---

## 3. `api`（Hono）

```bash
pnpm dlx create-hono@latest api --template nodejs --pm pnpm --install
```

`--install` を付けないと「依存をインストールするか」の対話プロンプトで止まり、
非対話環境ではエラーになる。付けると `api` を単独のプロジェクトとして
インストールしてしまうので、次のものを消してルートの workspace に統一した。

| 消したもの | 理由 |
|---|---|
| `api/node_modules` `api/pnpm-lock.yaml` | ルートの `pnpm install` で作り直す |
| `api/pnpm-workspace.yaml` | 入れ子の workspace。`onlyBuiltDependencies` だけルートへ移した |
| `api/.gitignore` `api/README.md` | テンプレート付属。ルートに同じものがある |

`api/src/index.ts` のポートを `3000` から `8787` に変えた。`web` と衝突するため。

---

## 4. lint / formatter

```bash
pnpm add -Dw oxlint oxfmt
pnpm install
pnpm oxlint --init
pnpm oxfmt --init
```

`pnpm install` は `--skip-install` にした `web` の依存を入れるため。

生成された設定を手で書き換えた。

| ファイル | 変更 |
|---|---|
| `.oxlintrc.json` | plugins に `react` `nextjs` を追加。`web/src/generated/**` と `web/src/components/ui/**` を除外 |
| `.oxfmtrc.json` | `**/*.md` `web/src/generated/**` `web/src/components/ui/**` を除外 |

Markdown を除外したのは、docs の表や段落を formatter に触らせないため。
shadcn の生成物と orval の生成物は CLI の流儀に任せる。

---

## 5. shadcn/ui

```bash
cd web
pnpm dlx shadcn@latest init -d --no-monorepo
```

`-d` で `--template=next --preset=base-nova` の既定になる。
`components.json` の style は `base-nova`、baseColor は `neutral`、アイコンは lucide。
`src/components/ui/button.tsx` と `src/lib/utils.ts` が生成され、`globals.css` が更新される。

---

## 6. 確認

```bash
pnpm --filter web exec next typegen
pnpm --filter web exec tsc --noEmit
pnpm --filter api exec tsc --noEmit
pnpm format
pnpm format:check
pnpm lint
pnpm --filter api dev    # http://localhost:8787 が Hello Hono! を返す
pnpm --filter web dev    # http://localhost:3000 が 200 を返す
```

`next typegen` を先に走らせるのは、Next.js 16 が `LayoutProps` などの型を
`.next/types/` に生成するため。生成前に `tsc` を走らせると `LayoutProps` が見つからない。
`next dev` か `next build` を一度動かしても同じ型ができる。

---

## 7. 段階 0: `api` と型生成

```bash
pnpm --filter api add @hono/zod-openapi zod
pnpm --filter api add -D yaml
pnpm --filter web add @tanstack/react-query
pnpm --filter web add -D orval
```

`yaml` は `openapi.yaml` を書き出すスクリプトだけが使う。
`@tanstack/react-query` を段階 0 で入れるのは、orval が生成する hook がこれを import するため。
画面から使うのは `XxxClientContainer` を作る段階から。

`api` のコードは手で書いた。構成は [backend.md §3](backend.md) にある。
`api/tsconfig.json` は `rootDir` を外して `db/` も対象にし、`.ts` 拡張子付きの import を許可した。

```bash
pnpm openapi                 # api/openapi.yaml → web/src/generated/
pnpm db:reset                # api/booklog.db を作り直してシード投入
cp web/.env.example web/.env.local
```

### つまずいた点

| 現象 | 対処 |
|---|---|
| `app.use(...).route(...)` とチェーンすると `doc31` が型に無いと言われる | `.use()` の戻り値は素の Hono 型。チェーンせず文に分ける |
| orval が GET に `useMutation`、POST に `useQuery` も生成した | `override.query` の `useQuery` / `useMutation` を消して既定に戻す |
| 生成された `Error` 型がグローバルの `Error` と同名になった | zod スキーマ側の名前を `ErrorResponse` にする |

### 確認

```bash
pnpm --filter api typecheck
pnpm --filter web typecheck   # next typegen && tsc --noEmit
pnpm lint
pnpm format:check
API_DELAY=0 pnpm --filter api dev   # curl で全エンドポイントを叩いた
```

生成クライアント → mutator → `api` → mapper の経路は、Node から `listBooks()` と `toBook()` を呼んで確かめた。
404 は `ApiError` として throw される。

---

## 8. 段階 1: `/books` と `/books/[bookId]`

```bash
cd web
pnpm dlx shadcn@latest add input table badge skeleton native-select -y
```

状態の絞り込みはネイティブの `<select>` を包んだ `native-select` にした。
Base UI の `Select` はクライアントの状態を持つので、まず素の select で足りるかを見る。

コードは手で書いた。層ごとの置き場は次のとおり。

| 層 | 置いたもの |
|---|---|
| `app/` | `/` → `/books` のリダイレクト、`books/layout.tsx` の Provider マウント、`page.tsx` の結線、`error.tsx` |
| `views/book-list/` | Page、Container、絞り込み欄、行、Skeleton、`apis/functions/updateBookStatus.ts` の Server Action。文言は 1 箇所ずつなのでベタ書き |
| `views/book-detail/` | Page、Container、書誌情報とメモ一覧の Presentational / Container / Skeleton |
| `features/book/` | `model.ts` に絞り込み条件の型、`constants.ts` にラベル辞書、`providers/` `apis/functions/` `apis/mappers/` `lib/filterBooks.ts` `components/BookStatusBadge/` |
| `features/book-note/` | `model.ts` `apis/mappers/toBookNote.ts` `apis/functions/fetchBookNotes.ts` |
| `shared/` | `apis/actionResult.ts` `lib/formatDate.ts` |

mapper は当初 `lib/` に置いていたが、`@/generated/model` を import するので `apis/mappers/` へ移した。
これで生成型を知るのは `apis/` の中だけになる ([directory-conventions.md](directory-conventions.md) の「apis の内側」)。

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| 生成型のレスポンスが `200 \| 404` の union で `data` に `ErrorResponse` が混ざる | `response.status === 200` で絞ってから mapper に渡す。mutator が 4xx を throw するので実行時には 404 側に入らない |
| 存在しない本の URL が HTTP 200 を返す | `notFound()` を Suspense 境界の中で呼んでいるため。ストリーミングが始まった後なのでステータスは変えられず、境界の中に not-found の UI が出る。見出しを先に出す設計とセットの挙動 |
| `/` の飛び先 | `/dashboard` ができるまで `/books` にしてある。段階 4 で戻す |

### 確認

```bash
pnpm dev
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/books      # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/books/1    # 200
```

HTML に本のタイトル、絞り込み欄、読了トグルのボタン、詳細の書誌情報とメモが含まれることを curl で確認した。
読了トグルの Server Action と、一覧 → 詳細 → 一覧 での絞り込み条件の保持は、ブラウザで確認する。

---

## 9. Storybook と Vitest

```bash
cd web
pnpm dlx storybook@10.6.0 init --type nextjs --builder vite --features docs test --yes --no-dev --package-manager pnpm
```

`--type nextjs --builder vite` で framework が `@storybook/nextjs-vite` になり、`--features test` で
`@storybook/addon-vitest` と Vitest、Playwright (chromium) が入る。`.storybook/main.ts` `.storybook/preview.tsx`
`vitest.config.ts` `vitest.shims.d.ts` が生成される。

### 生成後に直したもの

| 生成物 | 対処 |
|---|---|
| `src/stories/` のサンプル | 削除 |
| `@chromatic-com/storybook` | addon と依存から外した。使わない |
| `@vitest/coverage-v8` | 依存から外した。必要になったら入れる |
| `vitest` `vite` `playwright` `@vitest/browser-playwright` が `latest` | 版を固定。特に vitest は 5 系が入るが `@storybook/addon-vitest` の peer が `^3 || ^4` なので 4 系に落とした |
| `vitest.config.ts` | `.mts` に改名。`package.json` が `"type": "module"` ではないため、`.ts` だと Vite が CJS 扱いで警告を出す |
| `.storybook/main.ts` の `stories` | `../src/**/*.stories.tsx` だけにした。mdx は書かない |
| `.storybook/preview.tsx` | `src/app/globals.css` を import して Tailwind と shadcn のテーマを当てる。ツールバーの「スロットの遅延」と decorator を `.storybook/slotDelay.tsx` から登録する |
| `vitest.config.mts` | `unit` project (node、`src/**/*.test.ts`) を追加し、`resolve.alias` で `@/` を `src/` に向けた |
| `package.json` | `test` (`vitest run`) と `test:watch` を追加。ルートにも `test` (`pnpm -r test`) を追加 |
| `.gitignore` | `storybook-static/` と `*storybook.log` を追加 |

### 書いたもの

| 種別 | ファイル |
|---|---|
| fixtures | `features/book/fixtures/books.ts` (状態ごとに 1 冊)、`features/book-note/fixtures/bookNotes.ts` (改行入りを 1 件含む) |
| story (features) | `BookStatusBadge` |
| story (book-list) | `BookRow` (更新失敗の play)、`BookRows`、`BookRowsSkeleton`、`BookFilterField` (入力の play)、`BookListPage` (絞り込みで行が減る play) |
| story (book-detail) | `BookInfo` `BookInfoSkeleton` `BookNoteList` (空あり) `BookNoteListSkeleton` `BookDetailPage` (両方ロード中・書誌情報だけ・メモだけロード中・レイアウトシフトの検査) |
| test (純粋関数) | `apis/mappers/mapBookStatus` `apis/mappers/toBook` `apis/mappers/toBookNote` `lib/filterBooks` `shared/lib/formatDate` |
| test (apis/functions) | `fetchBook` (200 の mapping、404 → `undefined`、500 → `ApiError`)、`fetchBooks`、`fetchBookNotes` (パス、空配列、404)、`updateBookStatus` (body が `on_hold`、成功時の `revalidatePath`、失敗は値で返す)。`shared/fixtures/stubFetch.ts` で `fetch` を差し替える ([tech-stack.md §7](tech-stack.md)) |
| Storybook の仕組み | `.storybook/slotDelay.tsx` (ツールバーの「スロットの遅延」、decorator、`Delayed`)、`shared/fixtures/expectStable.ts` (play でレイアウトシフトを検査する helper) |

Page の story はスロットに取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
Provider を読む部品 (`BookFilterField` `BookRows` と両者を含む `BookListPage`) は decorator で `BookFilterProvider` に包む。
`BookListPage` の play で、入力欄と行が同じ Provider を読んで絞り込みが効くことを確かめている。

Skeleton から中身への切り替わりは、Page の story の `parameters.slots` にスロット名と Skeleton を宣言し、
ツールバーの遅延で見る ([tech-stack.md §7](tech-stack.md))。`BookDetailPage` の `NoLayoutShift` は
`globals: { slotDelay: 800 }` で遅延を固定し、「メモ」の見出しが書誌情報の解決前後で動かないことを play で検査する。

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| story を増やした初回の実行で `Failed to fetch dynamically imported module` が出て 5 件落ちる。2 回目は通る | Vite が `@base-ui/react/input` と `lucide-react` をテスト中に最適化して再読み込みしたため。storybook project の `optimizeDeps.include` に UI 部品が使う外部依存を列挙して、最初から最適化させる |
| 遅延させるスロットが永遠に解決しない | 最初は story 側に Suspense を書き、その内側の部品で Promise を作っていた。Suspense 境界の内側は初回に suspend すると丸ごと捨てられて作り直されるので、Promise が毎回新しくなる。Suspense を `Delayed` の中に入れ、Promise を境界の外で持つようにした |
| `NoLayoutShift` が「248 が 244 になる」と落ちた | `BookInfoSkeleton` が本物より 4px 低かった。行が `h-4` で `gap-y-3`、本物は text-sm の 20px 行で `gap-y-2`。Skeleton を `h-5` と `gap-y-2` に揃え、Badge の行は丸角にした。`BookNoteListSkeleton` も同じ計算で 1 件 4px 低く、メタ行 `h-4`・本文 `h-5`・`space-y-1` に直した。検査が実際にずれを見つけた例 |
| Page ごとに遅延つきの story を render で手書きすると繰り返しが多い | 「スロット名 → Skeleton」の対応だけが Page 固有で、残りは定型。定型を `.storybook/` の decorator に寄せ、story は `parameters.slots` の 1 行にした |
| Skeleton と中身を並べて比べる `WithSkeleton` story | 一度書いたが削除した。ツールバーの遅延で切り替わりが見えるようになり役目が無くなった上、別コンポーネントの Skeleton を story の中で描くのは「1 ディレクトリ = story 1 ファイル」の単位を跨ぐため |
| story の実行中に Base UI が `nativeButton` の警告を出す | `Button` に `render={<Link />}` を渡している箇所。`<a>` を描くのに `nativeButton` が既定の true のまま。テストは落ちない。段階 2 で `buttonVariants` + `Link` に直した (§10) |
| `apis/functions` のテストで msw を試して戻した | orval 8.36 の `output.mock` は `mock: { generators: [{ type: "msw" }, { type: "faker" }] }` の形 (`mock: { type: "msw" }` は TypeError)。生成された handler は 200 固定で 404 / 500 は手書きになり、省ける量が無かった。`msw/node` は Node 26 で `localStorage` の `ExperimentalWarning` も出す。依存・生成物・設定をすべて外し、`fetch` のスタブに戻した。理由と再検討の条件は [tech-stack.md §7](tech-stack.md) |
| `pnpm remove` のあとも lockfile に msw が残る | peer として解決した snapshot が残るため。`git checkout -- pnpm-lock.yaml` で戻し、`pnpm install --frozen-lockfile` が通ることを確認した |

### 確認

```bash
pnpm --filter web test              # unit と storybook の 2 project。20 files / 43 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
pnpm --filter web exec storybook build --quiet -o /tmp/storybook-static
pnpm --filter web storybook         # http://localhost:6006
```

Playwright はシステムライブラリ無しで入る。WSL の Ubuntu では chromium がそのまま headless で動いた。
動かない環境では `pnpm --filter web exec playwright install chromium --with-deps` を実行する。

---

## 10. 段階 2: `/books/new` と `/books/[bookId]/edit`

コードは手で書いた。`views/book-form/` を 1 つ切り、作成と編集の 2 画面を受け持つ。

| 置き場 | 置いたもの |
|---|---|
| `model.ts` | `BookFormValues` (入力欄の値。文字列のまま)、`BookFormSchema` (zod。status は disabled で送られないので optional)、`BookFormState`、`BookFormAction`、`EMPTY_BOOK_FORM_VALUES` |
| `lib/` | `parseBookForm` (FormData → スキーマで検証 → 値と項目ごとのエラー)、`toBookFormValues` (ドメイン型 → 初期値) |
| `apis/mappers/` | `toBookCreate` `toBookUpdate` (フォームの値 → 生成型)。`toBookUpdate` は status が送信されたときだけ含める |
| `apis/functions/` | `createBook` `updateBook` の Server Action。検証 → 通信 → `revalidatePath` → `redirect` |
| `components/BookForm/` | Presentational。`useActionState` を持ち、action は props で受ける。`BookFormField.tsx` はラベルとエラーの枠で、付属品の最初の実例 |
| `components/BookForm/BookFormContainer.tsx` | 編集だけが使う。取得して `notFound()`、初期値と `bind` した action を渡す |
| `components/BookFormSkeleton/` | 編集でフィールドが届くまでの見た目 |
| `pages/` | `BookFormPage` (骨格)、`BookNewFormPageContainer` (Suspense も Container も無い)、`BookEditFormPageContainer` (フィールドだけ境界の内) |
| `app/` | `books/new/page.tsx` `books/[bookId]/edit/page.tsx` |

作成と編集の差は、`pages/` の 2 つの Container と、`BookForm` に渡す props (`defaultValues` `statusLocked` `submitLabel` `action`) にだけ出る。
`BookForm` と `BookFormPage` はどちらの画面かを知らない。決めごとは [tech-stack.md §5](tech-stack.md) にある。

### 書いたもの

| 種別 | ファイル |
|---|---|
| story | `BookForm` (作成・編集・検証エラー・API 失敗。編集の play で disabled の select が FormData に無いことを確かめる)、`BookFormSkeleton`、`BookFormPage` (作成・編集・編集のロード中) |
| test | `parseBookForm` (空白の除去、必須、ページ数、status が無いときの引き継ぎ)、`toBookFormValues`、`toBookCreate`、`toBookUpdate` (status を外す)、`createBook` `updateBook` (検証で止まる、送る body、`revalidatePath` と `redirect`、404 と 500) |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| 検証エラーの story で送信してもメッセージが出ない | `<input type="number" min={1}>` に `0` を入れるとブラウザの制約検証が送信を止める。`<form noValidate>` にして検証を Server Action に寄せた |
| 編集画面で status の select を `disabled` にすると FormData に `status` が無い | 論点そのもの (docs/backend.md §1)。`parseBookForm` は `submittedStatus: undefined` として返し、`toBookUpdate` は body に含めない。ブラウザで保存して api の `status` が変わらないことを確認した |
| `Button` に `render={<Link />}` を渡すと Base UI が `nativeButton` の警告を出す | 最初は `nativeButton={false}` を付けて警告だけ消したが、Base UI の `Button` は `render` 先にも `role="button"` を付けるので `<a>` がリンクとして読まれない (ヘッドレスブラウザのスナップショットでも `button "編集"` になっていた)。`Button` を使わず `buttonVariants()` を `className` に当てた素の `Link` に変えた。段階 1 の 3 箇所。story の play で `getByRole("link")` が取れることを確かめる |

### 確認

```bash
pnpm --filter web test              # 29 files / 69 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
API_DELAY=0 pnpm dev
```

ヘッドレスブラウザで次を確かめた。`/books/new` を空のまま送ると 3 項目のエラーが出る。値を入れて送ると `/books/7` へ redirect し、
api に `status: reading` で保存される。`/books/7/edit` では状態の select が `disabled` で、タイトルとページ数を変えて保存すると
`/books/7` に戻り、api の `status` は `reading` のまま変わらない。確認後は `pnpm db:reset` でシードに戻した。

---

## 11. 段階 3: `/books/[bookId]/notes` と `/books/[bookId]/progress`

```bash
cd web
pnpm dlx shadcn@latest add textarea -y
```

コードは手で書いた。api 側のエンドポイント (`/books/:bookId/notes` `/books/:bookId/progress`) は段階 0 で作ってあるので、web だけ足した。
主眼は複数形 (notes = コレクション) と単数形 (progress = 単一リソース) の対比で、差は `app/` と `pages/` のファイル構成に出る。

```
app/books/[bookId]/
├── notes/                          複数形
│   ├── page.tsx                    一覧            → views/book-note-list
│   ├── new/page.tsx                作成            → views/book-note-form (BookNoteNewFormPageContainer)
│   └── [noteId]/edit/page.tsx      編集。id が付く → views/book-note-form (BookNoteEditFormPageContainer)
└── progress/                       単数形
    └── page.tsx                    編集だけ。id 無し → views/book-progress-form (BookProgressFormPageContainer が 1 つ)
```

| 置き場 | 置いたもの |
|---|---|
| `features/book-progress/` | 新設。`model.ts` (`BookProgress`。独自の id を持たず `bookId` で引く)、`apis/mappers/toBookProgress`、`apis/functions/fetchBookProgress`、`fixtures/` |
| `features/book-note/components/` | `BookNoteList` と `BookNoteListSkeleton` を `views/book-detail` から移した。詳細とメモ一覧の 2 つの view で使うため。`showEditLink` を足し、一覧では編集リンクを出す。リンク先は `shared/routes` から取る |
| `views/book-note-list/` | `pages/` だけ。一覧の部品は features のものなので、この view は見出しと追加リンクを置くだけ |
| `shared/routes/routes.ts` | 画面の URL を組み立てる関数。views の `Link`、Server Action の `redirect` `revalidatePath`、`app/layout.tsx` のナビのベタ書きを全部ここに寄せた |
| `views/book-note-form/` | `book-form` と同じ形。`model.ts` `lib/parseBookNoteForm` `lib/toBookNoteFormValues` `apis/mappers/toBookNoteCreate` `toBookNoteUpdate` `apis/functions/createBookNote` `updateBookNote`、`components/BookNoteForm/` (+ 編集だけの Container)、`components/BookNoteFormSkeleton/`、`pages/` に Page と New / Edit の 2 つの Container |
| `views/book-progress-form/` | `model.ts` (スキーマは `totalPages` を受けて作る。上限は業務ルール)、`lib/` `apis/mappers/toBookProgressUpdate` `apis/functions/updateBookProgress`、`components/BookProgressForm/` (Container が `fetchBook` と `fetchBookProgress` を並列に取って合成)、`components/BookProgressFormSkeleton/`、`pages/` に Page と **Container 1 つ** |
| `shared/components/FormField/` | `BookForm/BookFormField.tsx` を昇格。3 つのフォームから使うため (付属品はディレクトリの外から import しない) |
| `shared/layouts/FormPageLayout/` | 戻るリンク + 見出し + フォームの骨格。3 つの `XxxFormPage` が同じ形だったので出した。`layouts/` カテゴリの最初の実例 |
| `shared/lib/fieldErrors.ts` | `firstFieldErrors` (zod のエラーを 1 項目 1 メッセージに潰す) と `hasFieldErrors`。`parseBookForm` からも使うように直した |
| `shared/fixtures/formDataOf.ts` | テストで FormData を作る helper。3 つのテストファイルに同じものが並んでいたので出した |

Server Action の引数を並べると、URL の差がそのまま出る。

```ts
createBookNote(bookId, state, formData)                 // 親 id を持つ作成。POST /books/:bookId/notes
updateBookNote(bookId, noteId, state, formData)         // ネストした編集。   PATCH /books/:bookId/notes/:noteId
updateBookProgress(bookId, totalPages, state, formData) // 単一リソース。     PUT /books/:bookId/progress。自分の id は無い
```

### 書いたもの

| 種別 | ファイル |
|---|---|
| story | `FormField` (hint / error)、`FormPageLayout`、`BookNoteList` に `WithEditLink` を追加、`BookNoteListPage` (追加と編集のリンク先、Loading、Empty)、`BookNoteForm` (作成・編集・検証エラー・API 失敗)、`BookNoteFormSkeleton`、`BookNoteFormPage` (New / Edit / EditLoading)、`BookProgressForm` (Default・上限超えの検証エラー・API 失敗。New に相当する story は無い)、`BookProgressFormSkeleton`、`BookProgressFormPage` (Default / Loading) |
| test | `fieldErrors`、`routes` (複数形と単数形のパスの形)、`toBookProgress`、`fetchBookProgress`、`parseBookNoteForm` (0 ページを受け付ける、空白の除去と改行の保持)、`toBookNoteFormValues`、`toBookNoteCreate` `toBookNoteUpdate`、`createBookNote` `updateBookNote` (パスに載る id、`revalidatePath` × 2 と `redirect`、404 と 500)、`parseBookProgressForm` (下限 0 と上限 totalPages の境界)、`toBookProgressFormValues`、`toBookProgressUpdate`、`updateBookProgress` (id 無しのパスに PUT、上限超えは通信しない) |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| メモの編集画面の初期値をどう取るか。api にメモの単体 GET が無い | メモには詳細画面を作らないので単体 GET も無い ([backend.md §4](backend.md))。`BookNoteFormContainer` は一覧 (`fetchBookNotes`) を取って `noteId` で選ぶ。本が無ければ一覧が `undefined`、メモが無ければ `find` が外れ、どちらも `notFound()`。エンドポイントを足すより「詳細を持たない」判断をそのまま残すほうを選んだ |
| 進捗の上限 (本のページ数) と現在値 (進捗) が別のエンドポイント | 1 関数の通信は 1 回なので Container で合成する。`BookProgressFormContainer` が `Promise.all` で 2 つを取り、上限は Server Action に `bind` で渡す。スキーマは `createBookProgressFormSchema(totalPages)` と関数にした。上限が本ごとに違うため |
| `BookFormField` を `BookNoteForm` から import したくなった | 付属品はディレクトリの外から import しない。した時点でコンポーネントなので `shared/components/FormField/` に昇格し、story を書いた。「1 箇所ならベタ書き、2 箇所で昇格」の実例 |
| `BookNoteList` を `views/book-note-list` からも使いたい | 「同じドメインの複数の view で使うものは features」の実例。`features/book-note/components/` に移し、Container も一緒に移した。一覧だけが出す編集リンクは `showEditLink` で切り替える |
| features が編集リンクの URL を知ってよいか | 最初は `actions?: (note) => ReactNode` のスロットで view から渡していたが、用途が編集リンク 1 つなので抽象が広すぎた。[structure-notes.md §4](structure-notes.md) の「URL は app の持ち物」を、URL の**形**を `shared/routes/routes.ts` に集める形で実現し、features はその関数を呼ぶことにした。FSD 公式も shared の segment 例に `routes` (route constants) を挙げており、公式チュートリアルでは pages と shared のヘッダーだけがリンクを書く。既存の views と Server Action のベタ書きも全部 `routes` に置き換えた |
| `BookFormPage` `BookNoteFormPage` `BookProgressFormPage` が同じマークアップ | 骨格を `shared/layouts/FormPageLayout` に出した。各 `XxxFormPage` は [screens.md §3](screens.md) の写像先として名前を持つだけの薄い部品になった。`BookProgressFormPage` は new / edit が無いので `title` `backHref` を props に出さず固定にしてある |
| 単一リソースのフォームは「新規」が無い | `pages/` に Container が 1 つ、story に `New` が無く `Loading` が必ずある、Presentational に `submitLabel` が無い。book-form の「作成側には Container も Suspense も無い」と逆の差が出る |
| story の実行中に Base UI が「uncontrolled FieldControl の default value が変わった」と warn する | 送信後に action が返した `values` を `defaultValue` に入れ直す設計 (tech-stack §5) によるもので、段階 2 の `BookForm` でも出ていた。テストは落ちない。放置 |
| フォームが 3 つになり、tech-stack §5 の「入れ時」が来た | 手書きの定型のうち、ラベルとエラーの枠 (`FormField`) と zod エラーの整形 (`firstFieldErrors`) は shared に出せた。残っているのは `formData.get()` の収集、項目ごとの `aria-*` の付け直し、`XxxFormState` の自作の 3 つで、各フォームに 1 回ずつ。Conform を入れるかの判断は [tech-stack.md §5](tech-stack.md) の表を更新して保留にした |
| Server Action が 6 本になった | [structure-notes.md §5](structure-notes.md) の「判断の時期」。`actions/` に分ける案は保留にし、現状の本数と重複の箇所を §5 に追記した |

### 確認

```bash
pnpm --filter web test              # 51 files / 128 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
API_DELAY=0 pnpm dev
```

ヘッドレスブラウザで次を確かめた。`/books/1/notes/new` を空のまま送ると 2 項目のエラーが出る。ページ 300 と改行入りの本文を入れて送ると
`/books/1/notes` へ redirect し、api に `page: 300` で保存され、`/books/1` (詳細) にも新しいメモが出る (再検証)。
一覧の「編集」から `/books/1/notes/5/edit` を開くと初期値が入っており、ページを 301 にして保存すると一覧に戻り api も 301 になる。
`/books/1/progress` に 999 を入れると「ページ数 (456) 以下で入力してください」が出て通信しない。300 にして保存すると `/books/1` へ戻り、
api の `current_page` が 300 になる。`/books/1/notes/999/edit` は not-found の UI が出る (段階 1 と同じく HTTP は 200)。
確認後は `pnpm db:reset` でシードに戻した。

---

## 未実施

この時点では入れていないもの。それぞれの段階で入れる。

| | 入れる段階 |
|---|---|
| `/settings/*` `/stats/monthly` `/notes/recent` のエンドポイント | 段階 4 と 5 |
| `api` の Vitest (`app.request()`、DB の分離、`API_DELAY=0`) | 未定。web 側のスタブは「web はこう送る」しか担保しないので、契約の反対側として要る |
| フォームライブラリ Conform (`@conform-to/react` + `@conform-to/zod`) | 段階 3 でフォームが 3 つになった。入れるかどうかは判断待ち。現状の残り定型と判断材料は [tech-stack.md §5](tech-stack.md) |
| Server Action を `apis/functions/` から `actions/` に分ける | 段階 3 で Server Action が 6 本になった。判断待ち。本数と重複の箇所は [structure-notes.md §5](structure-notes.md) |
| メモの削除 (`DELETE /books/:bookId/notes/:noteId`) | api にはあるが画面は未実装。一覧の行にインライン操作として置くなら `BookRow` の読了トグルと同じ形 (行単位の pending / error) になる |
| 詳細画面に進捗を出す | 進捗を更新しても詳細には現れない。出すなら `features/book-progress` の部品を 3 つ目の Suspense 境界として `BookDetailPage` に足す。段階 4 のダッシュボードで進捗を出すので、そのときに合わせて考える |
| ヘッダーを `shared/layouts/AppLayout` に出す | 段階 4 と 5 でナビのリンクが増える前に切る ([structure-notes.md §4](structure-notes.md)) |
