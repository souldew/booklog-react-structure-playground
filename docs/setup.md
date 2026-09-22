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

## 未実施

この時点では入れていないもの。それぞれの段階で入れる。

| | 入れる段階 |
|---|---|
| `/settings/*` `/stats/monthly` `/notes/recent` のエンドポイント | 段階 4 と 5 |
| Storybook、Vitest | 最初の Presentational を作るとき |
