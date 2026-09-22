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
| `.storybook/preview.tsx` | `src/app/globals.css` を import して Tailwind と shadcn のテーマを当てる |
| `vitest.config.mts` | `unit` project (node、`src/**/*.test.ts`) を追加し、`resolve.alias` で `@/` を `src/` に向けた |
| `package.json` | `test` (`vitest run`) と `test:watch` を追加。ルートにも `test` (`pnpm -r test`) を追加 |
| `.gitignore` | `storybook-static/` と `*storybook.log` を追加 |

### 最初に書いたもの

| 種別 | ファイル |
|---|---|
| fixtures | `features/book/fixtures/books.ts`。状態ごとに 1 冊 |
| story | `BookStatusBadge` `BookRow` (更新失敗の play 付き) `BookRowsSkeleton` |
| test | `apis/mappers/mapBookStatus` `apis/mappers/toBook` `lib/filterBooks` `shared/lib/formatDate` |

### 確認

```bash
pnpm --filter web test              # unit と storybook の 2 project。7 files / 15 tests
pnpm --filter web typecheck
pnpm lint
pnpm format:check
pnpm --filter web exec storybook build --quiet -o /tmp/storybook-static
pnpm --filter web storybook         # http://localhost:6006
```

Playwright はシステムライブラリ無しで入る。WSL の Ubuntu では chromium がそのまま headless で動いた。
動かない環境では `pnpm --filter web exec playwright install chromium --with-deps` を実行する。

---

## 未実施

この時点では入れていないもの。それぞれの段階で入れる。

| | 入れる段階 |
|---|---|
| `/settings/*` `/stats/monthly` `/notes/recent` のエンドポイント | 段階 4 と 5 |
| `BookInfo` `BookNoteList` とその Skeleton、`BookFilterField` `BookRows`、両 Page の story | 段階 1 の残り。導入時は動作確認に必要な 3 つだけ書いた |
| `toBookNote` のテスト | 同上 |
