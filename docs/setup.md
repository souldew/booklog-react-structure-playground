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
| `/` の飛び先 | `/dashboard` ができるまで `/books` にしてある。段階 4 (§15) で戻した |

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

## 12. ヘッダーを shared に出す

段階 4 と 5 でナビのリンクが増える前に、`app/layout.tsx` が直接持っていたヘッダーのマークアップを shared に出した
([structure-notes.md §4](structure-notes.md) の shared 版)。コードは手で書いた。

| 置き場 | 置いたもの |
|---|---|
| `shared/components/GlobalNav/` | リンクの一覧 (`NAV_LINKS`) と現在地の強調。`usePathname` を読むので `"use client"`。story は `/books`、`/books/2` (下の階層でも現在地)、ナビに無いパスの 3 つで、`aria-current="page"` の有無を play で見る |
| `shared/layouts/AppLayout/` | ヘッダー + `<main>` の骨格。`children` を受ける。story は `fullscreen` で、body と同じ `flex-col` の decorator に包む。§13 で `src/app/layouts/` へ移した |
| `app/layout.tsx` | html / body、フォント、globals.css、`<AppLayout>` を呼ぶだけになった |
| `.storybook/preview.tsx` | `parameters.nextjs.appDirectory: true`。`next/navigation` を story で差し替えるのに要る |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| 現在地の判定で `/` を前方一致にすると全ページで「booklog」が現在地になる | `/` だけ完全一致、それ以外は `pathname === href` か `pathname.startsWith(href + "/")`。`/books` は `/books/2` でも現在地になる |
| ヘッダーの見た目は `AppLayout` の story でも見えるが、現在地の切り替えは `GlobalNav` の story で見る | `AppLayout` の story は骨格 (`banner` と `main` があること) だけを見る。部品ごとに関心を分ける |

### 確認

```bash
pnpm --filter web test              # 54 files / 134 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
```

---

## 13. Next の `app` を `src/` の外に出し、`src/app` を FSD の app 層にする

コードは動かしただけで、中身は変えていない。判断と比較は [structure-notes.md §6](structure-notes.md)、規則は
[directory-conventions.md](directory-conventions.md) の app の節にある。

```bash
cd web
git mv src/app app                                        # Next の規約ファイルを src の外へ
git mv src/shared/layouts/AppLayout src/app/layouts/AppLayout
git mv app/globals.css src/app/styles/globals.css
```

| 追従した参照 | 変更 |
|---|---|
| `web/app/layout.tsx` | `@/app/layouts/AppLayout/AppLayout` と `@/app/styles/globals.css` を import |
| `.storybook/preview.tsx` | globals.css の import 先を `../src/app/styles/globals.css` に |
| `components.json` | shadcn の `css` を `src/app/styles/globals.css` に |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| ルートの `app` と `src/app` を両方置いてよいか | Next 16 の src Folder の文書に「`app` がルートにあれば `src/app` は無視される」とある。丸ごと移せば競合しない。`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/src-folder.md` |
| `@/` からの import は変わるか | 変わらない。`@/` は `src/` を指し、`web/app` のファイルは元から `@/views/...` で import していた |
| Tailwind の設定 | v4 は CSS 側で設定するので、`globals.css` の場所を変えても設定ファイルの書き換えは無い。`@import "tailwindcss"` がそのまま効く |
| CSS を `@/` alias で import できるか | できる。`web/app/layout.tsx` の `import "@/app/styles/globals.css"` で dev サーバーがスタイルを配信することを確認した |
| `.next/` の型 (`PageProps`) | `next typegen` を再実行すれば `web/app` から生成される。古い `.next/` は消してから確認した |

### 確認

```bash
pnpm --filter web test              # 54 files / 134 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
API_DELAY=0 pnpm dev                # 全 URL が 200、CSS が当たり、ヘッダーの aria-current が出ることを curl で確認
```

---

## 14. `features` を `entities` に改名し、絞り込みを `features/book-filter` に切り出す

層の名前を FSD に揃える。判断と対応表は [structure-notes.md §7](structure-notes.md)、規則は
[directory-conventions.md](directory-conventions.md) の §1 の表と features / entities / widgets の節にある。

```bash
cd web
git mv src/features src/entities                                   # 改名。中身は変えない
# @/features/ → @/entities/ を 49 ファイルで置換
mkdir -p src/features/book-filter/{providers,lib,components}
git mv src/entities/book/providers/BookFilterProvider.tsx src/features/book-filter/providers/
git mv src/entities/book/lib/filterBooks.ts src/entities/book/lib/filterBooks.test.ts src/features/book-filter/lib/
git mv src/views/book-list/components/BookFilterField src/features/book-filter/components/
```

| 変更 | 内容 |
|---|---|
| `entities/{book,book-note,book-progress,stats}` | 旧 `features/…`。import の置換のほか、コメント内の「features」を entities の意味に書き直した |
| `features/book-filter/` | `model.ts` (`BookFilter` `EMPTY_BOOK_FILTER`。旧 `entities/book/model.ts` から移動)、`providers/BookFilterProvider`、`lib/filterBooks`、`components/BookFilterField` (story 含む)。中身は import 先が entities に変わっただけ |
| 参照側 | `views/book-list` の `BookListPage` `BookRows` と story、`web/app/books/layout.tsx` が `@/features/book-filter/...` を import |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| 絞り込みを features に出すか、entities と views に分けたままにするか | 状態とロジックを entities、入力欄を views に分けると 1 つの操作が 2 層に割れる。条件は `web/app/books/layout.tsx` にマウントされて詳細をまたいで残るので、1 つの view に閉じていない。寿命を決め手に features に出した |
| features の slice 名 | views の `{domain}-{detail}-{suffix}` と対にして `{domain}-{action}`。フラットに並べればドメイン順に揃う。FSD の slice group (`features/book/filter/`) は entities / views が 1 段なのに features だけ 2 段になるので採らない |
| 改名後に features 層に入るもの | 絞り込みの 1 つ。読了トグルやフォームは 1 view の操作なので views のまま (FSD も「1 ページの操作は pages に」としている) |
| `entities` の旧定義 (複数ドメインで共通に使う名前のあるもの) | 消えた。User が出たら普通の entity として `entities/user` |

### 確認

```bash
pnpm --filter web test              # 67 files / 156 tests (件数は変わらない)
pnpm --filter web typecheck
pnpm lint
pnpm format:check
```

---

## 15. 段階 4: `/dashboard` (クライアント取得)

```bash
cd web
pnpm dlx shadcn@latest add progress -y
pnpm --filter web codegen        # orval.config.ts に query.useSuspenseQuery: true を足して再生成
```

api の 2 エンドポイント (§14 の前に追加済み) と entities の取得・型はそのまま使い、view はクライアント取得 (TanStack Query) で組んだ。
主眼は「パネルごとの境界」を Server Component ではなくクライアント取得で組むとどうなるか。決めごとは [tech-stack.md §4](tech-stack.md)。

| 置き場 | 置いたもの |
|---|---|
| `orval.config.ts` | `override.query.useSuspenseQuery: true`。GET ごとに `useXxxSuspense` と `getXxxSuspenseQueryOptions` が生える。既存の `useXxx` はそのまま |
| `entities/*/apis/hooks/` | `useBookReadingStats` `useRecentBookNotes` `useBooks({ status })` `useBookProgresses(bookIds)`。生成の Suspense 版 hook を `select` で mapper に通し、ドメイン型の値だけを返す。`useBookProgresses` は `useSuspenseQueries` に生成の queryOptions を渡す |
| `src/app/providers/QueryProvider` | QueryClient を `useState` で 1 つ作る。既定は `retry` 1 回だけ。`web/app/layout.tsx` でアプリ全体にマウント。`src/app/providers/` の最初のファイル |
| `shared/components/QueryBoundary/` | クライアント取得の境界。付属品 `QueryBoundaryClientOnly` (SSR とハイドレーション直後は fallback) と、react-error-boundary の `ErrorBoundary`・`QueryErrorResetBoundary`・`Suspense` を合成。story は story の中の `useSuspenseQuery` で suspend・失敗・再試行を再現 |
| `.storybook/queryClient.tsx` | 全 story を `QueryClientProvider` で包む decorator (`withQueryClient`)。`preview.tsx` が登録する。story 用に `retry` は切る。アプリの `QueryProvider` は既定値が story に向かないので読まない |
| `shared/components/LoadError/` | 失敗の見た目と再試行ボタン |
| `views/dashboard/` | `model.ts` (`ReadingBook`)、`components/` に 3 パネルの Presentational・Skeleton・**ClientContainer**、`pages/` に `DashboardPage` と `DashboardPageContainer` (`QueryBoundary` × 3)。Presentational と Skeleton と story は Server Component 版と同じ |
| `web/app/` | `dashboard/page.tsx`。`layout.tsx` (Root Layout) で `QueryProvider` をマウント。`page.tsx` のリダイレクト先を `/dashboard` に |
| `GlobalNav` `shared/routes` | 「ダッシュボード」を先頭に。`routes.dashboard()` |

### 書いたもの

| 種別 | ファイル |
|---|---|
| story | `LoadError` (再試行あり / なし)、`QueryBoundary` (Default、`FailsThenRetry`)、`ReadingBookList` `RecentBookNoteList` `BookReadingStatTable` と Skeleton、`DashboardPage` (Default / Loading / StatsOnly / NotesLoading / Empty) |
| test | 無し (hooks の単体テストは書かない。[tech-stack.md §7](tech-stack.md))。mapper と fetch のテストは §14 の前のコミットにある |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| `useSuspenseQuery` を Client Component で使うと SSR でも取得が走り、ブラウザで Skeleton が 2 回出る | サーバーで取得して描いた HTML が届いた後、ブラウザの QueryClient は空なのでもう一度 suspend する。`QueryBoundaryClientOnly` (`useSyncExternalStore` でマウント前は false) で、SSR とハイドレーション直後は fallback を描き、マウント後に取得を始める。SSR の HTML は 3 パネルとも Skeleton |
| 失敗後の再試行で同じエラーが即座に出る | TanStack Query がエラーをキャッシュしているため。`QueryErrorResetBoundary` の `reset` を `ErrorBoundary` の `onReset` に渡す。`resetErrorBoundary` が `onReset` を先に呼んでから自分の state を消す |
| QueryProvider を画面の層 (`web/app/dashboard/layout.tsx`) に置いていた | tech-stack §4 の旧規則に従ったが、`/dashboard` から離れると layout ごと外れてキャッシュが捨てられ、戻ると全部取り直す。アプリ全体に 1 つ置く一般的な形に変え、定義は app 層の `src/app/providers/` にした。規則も書き換えた |
| `useQuery` (`isPending` で分岐) ではなく `useSuspenseQuery` にした | 境界の位置と fallback の書き方を Server Component 版と揃え、比較できるようにするため。`isPending` 版だと分岐が ClientContainer の中に入り、Skeleton の置き場が変わる |
| 本の数だけ進捗を取る | `useSuspenseQueries` に `getGetBookProgressSuspenseQueryOptions(bookId, { query: { select } })` を渡す。本の取得と進捗の取得で 2 回 suspend する (id が分かるまで進捗は取れない)。Server Component 版の `Promise.all` と同じ形 |
| `QueryBoundary` の story で 1 回目だけ失敗させる | 試行回数を module の変数で数えると、再試行で「1 回目」に戻って失敗し続けた。描画ごとの `runId` をキーに数える |
| `staleTime` 60 秒だと、Server Action の更新がダッシュボードに出ない | 本の一覧で `updateBookStatus` を実行しても、`revalidatePath` は Server Component のページを作り直すだけで Query キャッシュには届かない。1 分以内に戻ると読書中のパネルが古いまま残る。`staleTime` を外し、戻るたびに取り直す形にした。`invalidateQueries` を入れるのはミューテーションをクライアントに寄せると決めたとき |
| `staleTime` を外しても 0 にはならない | `useSuspenseQuery` は `ensureSuspenseTimers` で `staleTime` を下限 1 秒に切り上げる。取得直後に stale になって取り直しが止まらなくなるのを防ぐため。画面を往復する分には毎回取り直す |
| 再取得の間に Skeleton は出ない | suspend の条件が `suspense && result.isPending` で、`isPending` はデータが無い状態を指す。キャッシュがあれば `success` のまま `isFetching` が立つだけなので、古いデータを出したまま裏で取り直し、届いた時点で書き変わる |
| story 用の `QueryClient` を decorator の JSX の中で `new` していた | Storybook は装飾済みの story 関数を React のコンポーネント型として描くので、decorator の本体は story ルートの再レンダーごとに走る。args やツールバーを操作するたび QueryClient が入れ替わりキャッシュが消える。`useState` で持つ小さなコンポーネントに切り出した (`QueryProvider` と同じ理由) |
| Provider を要する story が 1 件でも `.storybook/` に出した | shared から app 層は import しないので story にベタ書きしていたが、`.storybook/` は FSD の層の外で、全 story に効く decorator の置き場と規約で決まっている ([directory-conventions.md](directory-conventions.md))。2 件目から書き足す場所が要らない |
| `stats` という entity 名が薄い | 「何の統計か」が読めず、`book` `book-note` `book-progress` と並ばない。`entities/book-reading-stat` に改名し、型は `BookReadingStat`、api のスキーマ名も揃えた (URL `/stats/monthly` は変えない)。view の部品も `BookReadingStatTable` に |
| `getMonthlyStats` のレスポンス型は 200 だけ、`getBookProgress` は `200 \| 404` の union | `select` で `response.status === 200` に絞るのは union のほうだけ。fetch 版 (`fetchBookProgress`) と同じ扱い |
| Base UI の `Progress` に `aria-label` を付けても名前が変わらない | `ProgressLabel` が `aria-labelledby` を付け、そちらが優先される。progressbar の名前はラベルの文言 (「120 / 420 ページ」) |

### 確認

```bash
pnpm --filter web test              # 69 files / 160 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
API_DELAY=0 pnpm dev
```

`/` が `/dashboard` へ 307。`/dashboard` の SSR の HTML は見出し 3 つと Skeleton だけで、データは無い (`2026年` も `progressbar` も 0 件)。
ヘッドレスブラウザで開くと、月別の表 (6 行)、読書中の本 2 冊の読了率 (35% / 46%)、最近のメモの本へのリンクが出る。
ナビの「ダッシュボード」に `aria-current="page"` が付く。

---

## 16. `/dashboard` をサーバー取得に統一する

段階 4 で入れたクライアント取得 (TanStack Query) を撤去し、`/dashboard` を他の画面と同じ
Server Component + `Suspense` の形にした。決めごとは [tech-stack.md §4](tech-stack.md)。

```bash
cd web
pnpm remove @tanstack/react-query react-error-boundary
pnpm --filter web codegen        # orval.config.ts の client を "react-query" から "fetch" に戻して再生成
```

| 置き場 | 消したもの |
|---|---|
| `src/app/providers/` | `QueryProvider`。`src/app/` に残るのは `layouts/` と `styles/` の 2 つ |
| `shared/components/QueryBoundary/` | `QueryBoundary`、付属品の `QueryBoundaryClientOnly`、story |
| `shared/components/LoadError/` | 失敗の見た目と再試行ボタン、story |
| `entities/*/apis/hooks/` | `useBooks` `useBookProgresses` `useRecentBookNotes` `useBookReadingStats`。`apis/` の下に `hooks/` という segment は無くなった |
| `views/dashboard/components/*/` | 3 つの `XxxClientContainer` |
| `shared/apis/queryClient.ts` `.storybook/queryClient.tsx` | QueryClient の生成と、全 story を包む decorator (`withQueryClient`) |
| `web/app/layout.tsx` | `QueryProvider` のマウント |

| 置き場 | 置いたもの |
|---|---|
| `orval.config.ts` | `client: "fetch"`。`override.query` の `useSuspenseQuery` 指定も外した。生成物はエンドポイントごとの関数だけになり、hook は生えない |
| `views/dashboard/components/` | `ReadingBookListContainer` (`fetchBooks({ status: "reading" })` の後に `Promise.all` で `fetchBookProgress` を並列に取り、本と進捗を組にする)、`RecentBookNoteListContainer` (`fetchRecentBookNotes`)、`BookReadingStatTableContainer` (`fetchBookReadingStats`)。Presentational・Skeleton・story は段階 4 のまま |
| `views/dashboard/pages/DashboardPageContainer` | `QueryBoundary` × 3 を `Suspense` × 3 に。`BookListPageContainer` と同じ形 |
| `web/app/dashboard/error.tsx` | 画面単位のエラー表示。`app/books/error.tsx` と同じ形 |
| Server Action 6 本 | `revalidatePath(routes.dashboard())` を追加 (`updateBookStatus` `createBook` `updateBook` `createBookNote` `updateBookNote` `updateBookProgress`)。それぞれの `.test.ts` にも `expect(revalidatePath).toHaveBeenCalledWith("/dashboard")` を足した |
| `.storybook/preview.tsx` `vitest.config.mts` | `withQueryClient` decorator と、`optimizeDeps` の `@tanstack/react-query` を外した |

### 撤去に至った理由

クライアント取得で「パネルごとの境界」を作ると何が変わるかを見るために入れたが、次の順に畳んだ。

| 段階 | 分かったこと |
|---|---|
| 1. クライアントだけで取る | `useSuspenseQuery` は SSR でも動くので、サーバーとブラウザで 2 回取る。実測でリクエストが 5 本から 10 本になり、HTML が返るまで 0.08 秒から 1.59 秒に伸びた |
| 2. prerender を止める | `useSyncExternalStore` でマウント後だけ描く部品を入れると二重取得は消えるが、HTML から中身が消える。Next の SPA ガイドが挙げる形ではあるが、SSR を捨てる判断になる |
| 3. サーバーで prefetch して `HydrationBoundary` で渡す | 二重取得も消え、HTML にも中身が入る (実測でブラウザからのリクエストは 0 本)。ただし Server Component で `await` するのと結果が変わらない |

最後の形では TanStack Query の役割が「サーバーで取った値をブラウザのキャッシュに置く」だけになる。
ブラウザ側で再取得も楽観更新もせず、更新は Server Action と `revalidatePath` で回るので、そのキャッシュに用が無い。
入れ直す条件は、入力に応じた検索・ポーリング・無限スクロール・楽観更新のように、
ブラウザだけで完結する取得が要るようになったとき。

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| エラーの受け口がパネル単位から画面単位になった | `QueryBoundary` は境界ごとに `ErrorBoundary` を持てたが、Server Component の失敗を受けるのはルートの `error.tsx` で、粒度はルートセグメント。1 枚でも失敗すれば `/dashboard` 全体が差し替わる |
| 更新の反映は `revalidatePath` だけで決まる | Query キャッシュが無くなったので、段階 4 の `staleTime` の調整 (§15) は不要になった。代わりに、ダッシュボードに映る更新を持つ Server Action 6 本すべてに `revalidatePath(routes.dashboard())` を足す必要がある。1 本でも忘れると古いまま残る |
| 減った story は 2 ファイルだけ (69 → 67 files、160 → 156 tests) | 消えたのは `QueryBoundary` と `LoadError` の story で、3 パネルの Presentational と Skeleton、`DashboardPage` の story はそのまま動く。story を Presentational だけで完結させてあると、取得の方式を替えても効かなくなる範囲が狭い |
| 生成物から hook が消えても `apis/functions/` は変わらない | 段階 4 で hook を足したときも、`fetchBooks` などの関数は残したまま並べていた。Container が呼ぶ先を hook から関数に戻すだけで済み、entities の `apis/` とそのテストは触っていない |

### 確認

```bash
pnpm --filter web test              # 67 files / 156 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
API_DELAY=0 pnpm dev
```

`/dashboard` の SSR の HTML に 3 パネルとも中身が入る (月別の表の 6 行、読書中の本 2 冊の `progressbar`、
最近のメモの本へのリンク)。段階 4 では見出しと Skeleton だけだった箇所。

---

## 17. `/dashboard` をページ単位の一括取得にする

パネルごとに 3 本のエンドポイントを叩く形から、`GET /dashboard` 1 本にまとめた。
決めごとは [backend.md §4](backend.md)、境界の位置は [screens.md §5](screens.md)。

きっかけは「読書中の本」パネルの N+1。本の一覧を取ってから 1 冊ごとに
`/books/:bookId/progress` を叩いていて、まとめて取る口が api に無かった。
進捗だけ一括取得を足す案もあったが、**ポップコーン UI を避けることも同時に狙う**なら
パネルごとに分けておく理由が無くなるので、画面 1 枚を 1 回で取る形にした。

| 置き場 | 消したもの |
|---|---|
| `api/src/routes/` | `stats.ts` (`/stats/monthly`)、`notes.ts` (`/notes/recent`)。どちらもダッシュボード専用だった |
| `entities/book-reading-stat/apis/functions/` `entities/book-note/apis/functions/` | `fetchBookReadingStats`、`fetchRecentBookNotes` とそのテスト。前者はディレクトリごと空になった (mapper は残る) |
| `views/dashboard/components/*/` | 3 つの `XxxContainer`。取得は `pages/` の 1 か所になった |
| `DashboardPage.stories.tsx` | `StatsOnly` `NotesLoading`。一部のパネルだけ解決した姿は起きなくなった |

| 置き場 | 置いたもの |
|---|---|
| `api/src/routes/dashboard.ts` | `GET /dashboard`。読書中の本は `books JOIN book_progress` の 1 クエリで組にする。メモと統計のクエリは消した 2 ファイルから移した |
| `api/src/schemas.ts` | `ReadingBookSchema` (本と進捗の組)、`DashboardSchema` (パネル 3 つぶん) |
| `views/dashboard/model.ts` | `Dashboard` 型。`ReadingBook` はそのまま |
| `views/dashboard/apis/` | `mappers/toReadingBook` `mappers/toDashboard`、`functions/fetchDashboard`。入れ子の変換は entities の mapper に任せる |
| `views/dashboard/pages/DashboardPageSkeleton` | `DashboardPage` に 3 つの Skeleton を差したもの。画面全体の fallback |
| `web/app/dashboard/loading.tsx` | 画面単位の `Suspense` 境界。`error.tsx` と同じ粒度になった |
| `api/src/middleware/delay.ts` | `/dashboard` に 1200ms。`/stats/monthly` (300ms) `/notes/recent` (1500ms) の行は消えた |

### 気づいた点

| 現象 | 対処・理由 |
|---|---|
| 境界を置く場所が `PageContainer` から `loading.tsx` に移った | 取得が 1 回だと `PageContainer` が `await` してしまうので、`Suspense` はその外側にしか置けない。ルートセグメント単位の境界は Next の規約ファイルが持つ形が素直で、`error.tsx` と粒度も揃う |
| `DashboardPage` のスロット 3 つはそのまま残した | 境界は 1 つだが、スロットがあると「取得後の Presentational」と「Skeleton」を同じ枠に差し替えられる。`DashboardPageSkeleton` は `DashboardPage` にスロットで Skeleton を差しただけで、枠と見出しの実装は 1 か所のまま |
| `entities/book-reading-stat` から `apis/functions/` が消えた | 取得は画面の型に組み直す `views/dashboard` 側に移り、entity に残るのは型・mapper・`formatMonth`・fixtures。**entity は取得関数を持たなくても成立する**。mapper は `toDashboard` から呼ばれる |
| 生成型の `Book` が `ReadingBook` の中に入れ子になった | `toReadingBook` は `toBook` と `toBookProgress` を呼ぶだけになり、変換の実体は entity 側に残る。API のスキーマが変わったとき、直すのは相変わらず entity の mapper |
| `SELECT b.*` に進捗の列を混ぜても外に漏れない | 1 クエリで取った行をそのまま `book` に渡しているが、`DashboardSchema.parse` が入れ子の未知キーを落とす。`current_page` が `book` 側に出ることはない |
| ポップコーン UI と待ち時間はトレードオフ | 統計 (300ms) が先に出ていたぶん、画面に何か出るまでの時間は 300ms → 1200ms に伸びた。代わりにレイアウトが 3 回動くことは無くなった。遅延の表 ([backend.md §5](backend.md)) をそのまま見れば差が分かる |

### 確認

```bash
pnpm --filter api typecheck
pnpm --filter web test              # 65 files / 155 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
pnpm dev
```

```bash
curl -s localhost:8787/dashboard | jq 'keys'
# ["monthly_stats","reading_books","recent_notes"]
curl -s -o /dev/null -w "%{http_code}\n" localhost:8787/stats/monthly   # 404
```

`/dashboard` を開くと、まず画面全体の Skeleton (枠と見出しは出たまま) が届き、
1.2 秒後に 3 パネルが同時に中身へ変わる。SSR の HTML にも 3 パネルとも中身が入る。

---

## 未実施

この時点では入れていないもの。それぞれの段階で入れる。

| | 入れる段階 |
|---|---|
| `/settings/*` のエンドポイント | 段階 5。ダッシュボードが使う `/dashboard` は api に足してある |
| BFF (`web/app/api/` の Route Handler) を挟む経路 | [backend.md §7](backend.md)。ブラウザから取る画面が無くなったので、クライアント取得を入れ直す判断とセット ([tech-stack.md §4](tech-stack.md)) |
| `api` の Vitest (`app.request()`、DB の分離、`API_DELAY=0`) | 未定。web 側のスタブは「web はこう送る」しか担保しないので、契約の反対側として要る |
| フォームライブラリ Conform (`@conform-to/react` + `@conform-to/zod`) | 段階 3 でフォームが 3 つになった。入れるかどうかは判断待ち。現状の残り定型と判断材料は [tech-stack.md §5](tech-stack.md) |
| Server Action を `apis/functions/` から `actions/` に分ける | 段階 3 で Server Action が 6 本になった。判断待ち。本数と重複の箇所は [structure-notes.md §5](structure-notes.md) |
| メモの削除 (`DELETE /books/:bookId/notes/:noteId`) | api にはあるが画面は未実装。一覧の行にインライン操作として置くなら `BookRow` の読了トグルと同じ形 (行単位の pending / error) になる |
| 詳細画面に進捗を出す | 進捗はダッシュボードの「読書中の本」に出るが、詳細には現れない。出すなら 3 つ目の Suspense 境界として `BookDetailPage` に足す。読了率の計算は `entities/book-progress/lib/progressPercent` がある |
