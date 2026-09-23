# 構造の検討メモ

[directory-conventions.md](directory-conventions.md) は確定した規則だけを書く。
ここには、規則を決めるときに考えたこと、判断待ちの案、規則を読み違えやすい点の解説を置く。
確定したら conventions に移し、ここからは消すか「確定済み」と印を付ける。

---

## 1. view は複数のドメインを知ってよい (確定済み)

規則は [directory-conventions.md](directory-conventions.md) の views の節にある。ここには読み違えた経緯だけ残す。

`views/book-detail` が `entities/book` と `entities/book-note` の両方を import しているのを見て、
「book 側が book-note を読んでいる」と読めた。実際に両方を知っているのは view であって、
`entities/book` と `entities/book-note` は互いを import していない。

見誤りの元は 2 つ。

- view 名の `{domain}` が「その view が知ってよいドメイン」に見える。実際は画面の主題を表すだけ
- entities の節の「`{domain}` は views のフォルダ名の `{domain}` と対応させる」が import の条件に見える。実際は命名の指針

---

## 2. 画面を持たないドメインの置き場 (判断待ち)

例: 本の追加やコメントの投稿に反応してサンクスメッセージを出す gamification。
gamification という画面は無い。

### 置けるか

置ける。「行動に感謝する」はユーザーの操作に反応する処理で、画面ではなく操作の単位なので features (動詞の層) が置き場になる。
2 つ以上の view (本の追加、コメントの投稿) から呼ばれるので、features に出す条件も満たす。

| 中身 | 置き場 |
|---|---|
| どの行動に感謝するか、何回目で特別な文言か、といったルールと型 | `features/gamification-thanks/model.ts` |
| サンクス表示の状態 | `features/gamification-thanks/providers/ThanksProvider.tsx`。寿命はアプリ全体なので `src/app/providers/` で合成し `web/app/layout.tsx` からマウント |
| トーストの見た目 | `features/gamification-thanks/components/ThanksToast/` |
| 記録する処理 | `features/gamification-thanks/apis/functions/` か、通信が無ければ `lib/` |

呼ぶのは views。`views/book-form` の Server Action が成功時に記録関数を呼び、`views/timeline` のコメント投稿も同じ関数を呼ぶ。

### 「登録してもらった本の情報を出す」要件が来たとき

features は entities を import できるので、`entities/book` の `Book` 型や `BookStatusBadge` をそのまま使える。
以前 (features がドメイン単位で、兄弟 import を禁じていた頃) は必要な項目だけを自分の型で持つ詰め替えが要った。
いまも「本」の構造に依存したくなければ `{ kind: "book-added"; bookTitle: string }` のように必要な項目だけを持つ形は選べるが、必須ではない。

### 構成とは別の難所

`createBook` は成功すると詳細へ `redirect` するので、フォーム側の `useActionState` の状態は消える。
サンクスを詳細で出すには、Server Action で一時的な cookie を置いて `web/app/layout.tsx` の Server Component が読んで消す (flash) か、
`redirect("/books/7?thanks=book")` のようにクエリで運ぶか、のどちらかが要る。ディレクトリ構成ではなく Next の遷移の仕組みの話で、
どの案でも同じだけかかる。

### timeline について

コメントは本の入れ子ドメイン (BookNote に相当) なので、本を横断した一覧は新しいドメインではなく既存ドメインの別の切り口の画面。
view 名は `dashboard` と同じく CRUD に対応しない性質として `views/timeline` にし、中身は `entities/book-note` を使う。

---

## 3. features を「ドメイン横断」の層に読み替える案 (確定済み。§7 で実施)

§7 で実施した。層の名前は `domains` ではなく FSD の `entities` にし、`widgets` は残した。以下は検討時の記録。

単数ドメインの層を `domains` と呼び、`features` を複数ドメインにまたがるものの層にする案。

| 層 | 役割 | いまの対応 |
|---|---|---|
| `views/` | 1 画面 | 変わらず |
| `features/` | **複数ドメインにまたがる**ユースケース。gamification、ユーザー情報を載せたヘッダー。UI でもロジックでもよい | いまの `widgets` の役割 + 画面を持たないドメイン横断のルール |
| `domains/` | **単数ドメイン**。book、book-note、user | いまの `features` |
| `shared/` | ドメインを持たない部品 | 変わらず |

FSD の元の意味には近づく。FSD の `features` はユーザーのシナリオで複数の entity を使うもの、`entities` が業務の実体。
いまの規約は `features` を業務ドメインの単位に読み替えているので、`domains` と呼び直すと名前と中身が揃う。

得られるのは、gamification が `domains/book` と `domains/book-note` の型を直接 import できること。§2 の案 1 の詰め替えが要らなくなる。

### 決めること

| 論点 | 推奨 |
|---|---|
| `entities` を残すか | 「複数のドメインで共通して使われ、名前があるもの (`UserAvatar`)」は `domains/user` で表せる。廃止して層を減らす |
| `widgets` を残すか | 「複数ドメインの合成」は新しい `features` と重なる。`features` に吸収して廃止 |
| `domains` 同士の import | まず完全禁止。型が要る場面は id の文字列で持つか `features` で合成する。困った実例が出たら「`model` の型だけは import してよい」に緩める |

結果の import の向き:

```
app > views > features > domains > shared > components/ui
```

### 移行のコスト

機械的。ディレクトリの改名と `@/features/` を import している 28 ファイルの置換、docs の `features` の言及の書き換え
(directory-conventions、tech-stack、setup、screens の「features/ へのパネル集約」など)。テストと story はパスが変わるだけ。
`features/book` と `features/book-note` は互いを import していないので、改名で壊れる依存は無い。

### 結果

§7 のとおり。名詞の層は `entities`、動詞の層は `features`、`widgets` は UI ブロックの合成として残す。

---

## 4. ヘッダーの置き場 (確定済みの規則の解説)

規則は conventions の widgets の節「静的なルートへのリンクだけで済むなら shared で足りる」。

### なぜ shared でよいか

ヘッダーが持つ知識は「`/books` というリンクを出す」だけで、Book の型もデータも業務ルールも使わない。
**URL はドメインの持ち物ではなく app の持ち物**で、`entities/book` は自分が `/books` にあることを知らない
([screens.md §3](screens.md) が URL → view の写像を持つ)。ドメインの名前と URL の語が一致するのは同じ業務の語彙を使うからで、
URL がドメインに属するからではない。

entities に置くと、`/dashboard` `/books` `/settings/profile` へのリンクで複数ドメインの URL を 1 つの entity が知ることになり、
合成になる。合成が要るなら widgets、要らないなら shared。

| ヘッダーの中身 | 置き場 |
|---|---|
| 静的なリンクだけ | shared (または app のレイアウトにベタ書き) |
| ログインユーザーの名前やアバター | widgets。entities の user を合成 |
| 未読メモの件数バッジ | widgets。entities の値を合成 |

パスは `shared/routes/routes.ts` の関数 (`routes.bookDetail(id)` など) にまとめてあり、views の `Link` も Server Action の
`redirect` `revalidatePath` もヘッダーもここから取る (確定済み。規則は conventions の shared の節)。
ドメインの slice (entities) がリンクを出すときも、URL の形を書かずにこの関数を呼ぶ。`BookNoteList` の編集リンクが最初の例。

### 現状の構成

Next の Root Layout (`web/app/layout.tsx`) は html / body、フォント、メタデータだけを持ち、枠は app 層、ナビの部品は shared にある。

```
web/app/layout.tsx                      html / body、フォント、メタデータ。<AppLayout> と globals.css を呼ぶだけ
src/app/layouts/AppLayout/              ヘッダー + <main> の骨格 (画面をまたぐ枠)。children を受け取る。story あり
src/app/styles/globals.css              グローバル CSS
shared/components/GlobalNav/            リンクの一覧 (NAV_LINKS)。usePathname で現在地を強調 ("use client")。story あり
shared/routes/routes.ts                 パス関数。ナビのリンク先もここから取る
```

`AppLayout` は最初 `shared/layouts/` に置いていたが、Page の外側にあって URL が変わっても残る「枠」であり、
FSD が `app/layouts` に置くものそのものなので、app 層を `src/app` に作った時点 (§6) で移した。
`GlobalNav` は枠の中に置かれる「部品」なので shared のまま。

現在地の判定は `GlobalNav` の中にある。`/books` のリンクは `/books/2` のような下の階層でも現在地とし、`/` だけは完全一致にする。
強調は `aria-current="page"` と文字色で、story の play は `aria-current` で判定を見る。

`GlobalNav` の story は `parameters.nextjs.navigation.pathname` で現在地を切り替える。
`usePathname` を使うので `.storybook/preview.tsx` の `parameters` に `nextjs: { appDirectory: true }` を入れてある。

### widgets に移す場合の構成

ユーザー情報を載せるとき。`AppLayout` は app 層にあり widgets を import できるので、ヘッダーの中身を widgets に置き換えるだけで済む。
`web/app/layout.tsx` は変わらない。

```
web/app/layout.tsx                                    変えない
src/app/layouts/AppLayout/                            <header><Suspense fallback={<GlobalHeaderSkeleton />}><GlobalHeaderContainer /></Suspense></header><main>…
widgets/global-header/components/GlobalHeader/        Presentational。shared の GlobalNav と entities の UserAvatar を合成
widgets/global-header/components/GlobalHeader/GlobalHeaderContainer.tsx   fetchCurrentUser して GlobalHeader へ
widgets/global-header/components/GlobalHeaderSkeleton/
entities/user/                                        User 型、fetchCurrentUser、UserAvatar
shared/components/GlobalNav/                          変えない
```

import の向きは `app > widgets > entities > shared` の一方向で、shared の `GlobalNav` は widgets の存在を知らない。
`AppLayout` が shared にあった間は widgets を import できず header をスロットで受ける必要があったが、app 層に移したことで不要になった。
将来 `entities/book-note` の未読件数を足すときも `GlobalHeader` が並べるだけで、`GlobalNav` は変わらない。
静的なリンクだけの間は現状のままにし、データが要る部品が出た時点でこの形に移す。
段階 4 (`/dashboard`) と段階 5 (`/settings`) でナビに足すのは `GlobalNav` の `NAV_LINKS` への 1 行ずつ。

---

## 5. Server Action を `actions/` に分ける案 (判断待ち)

いまの `apis/functions/` には性質の違う 2 種類が同居している。

| 種類 | 例 | 性質 |
|---|---|---|
| API の薄いラッパー | `fetchBook` `fetchBooks` | 通信して値を返す。画面のことは知らない |
| Server Action | `createBook` `updateBook` `updateBookStatus` | 通信のほかに、検証・`revalidatePath`・`redirect` という**画面の都合**を持つ。値を返さず redirect で終わることもある |

`revalidatePath("/books")` は「一覧が `/books` にある」という画面の知識で、API の関心ではない。
分けるなら、Next の慣習どおり Server Action を slice の `actions/` に置き、`apis/functions/` は API のラッパーだけにする。

```
entities/book/apis/functions/updateBook.ts   PATCH /books/:id を叩いて Book を返すだけ
views/book-form/actions/updateBook.ts        検証 → entities の updateBook → revalidatePath → redirect
views/book-list/actions/updateBookStatus.ts  entities の updateBook → revalidatePath
```

| | 内容 |
|---|---|
| 得るもの | `PATCH /books/:id` のラッパーが 1 つになり、`updateBookStatus` と `updateBook` が別々に生成クライアントを呼ぶ重複が消える。`apis/` が「通信して値を返す」だけの層になり、`actions/` が「画面の都合」を持つ層になる |
| 規則との整合 | `actions/` は生成型に触らない (ラッパーがドメイン型で返す) ので、「`@/generated` は `apis/` の中だけ」はそのまま保てる |
| コスト | カテゴリが 1 つ増える。directory-conventions の `apis/functions/` の「Server Action もここ」を書き換え、既存 3 本を移す |
| 判断の時期 | 段階 3 (`book-note-form` `book-progress-form`) で Server Action が 5、6 本になったとき。いまの 3 本ではどちらでも破綻しない |

### 段階 3 の時点

Server Action は 6 本になった。

| 置き場 | Server Action | 叩くエンドポイント | 画面の都合 |
|---|---|---|---|
| `views/book-list/apis/functions/` | `updateBookStatus` | `PATCH /books/:id` | `revalidatePath("/books")` |
| `views/book-form/apis/functions/` | `createBook` `updateBook` | `POST /books` `PATCH /books/:id` | 検証、`revalidatePath` × 2、`redirect` |
| `views/book-note-form/apis/functions/` | `createBookNote` `updateBookNote` | `POST /books/:id/notes` `PATCH /books/:id/notes/:noteId` | 検証、`revalidatePath` × 2、`redirect` |
| `views/book-progress-form/apis/functions/` | `updateBookProgress` | `PUT /books/:id/progress` | 検証、`revalidatePath`、`redirect` |

重複しているのは `PATCH /books/:id` を `updateBookStatus` と `updateBook` が別々に呼ぶ 1 箇所だけで、段階 2 から変わっていない。
段階 3 で足した 3 本はそれぞれ別のエンドポイントで、ラッパーを entities に置いても呼ぶのは Server Action 1 本ずつになる。
つまり「重複が消える」効用はまだ 1 箇所分しかなく、増えたのは「`apis/functions/` に通信だけの関数と画面の都合を持つ関数が同居する」件数のほう
(`fetchXxx` 4 本、Server Action 6 本)。

分けるなら今が機械的に済む最後の機会で、段階 4 (`/dashboard`) は取得だけなので Server Action は増えず、段階 5 (`/settings`) で 2 本増える。
現状は分けずに据え置き。

---

## 6. app 層を FSD の原義に寄せる (確定済み)

規則は conventions の「ルーターの規約ディレクトリ (`web/app/`) と app 層 (`src/app/`)」の節にある。ここには比較と経緯を残す。

### なぜ変えたか

FSD の App 層は「アプリを動かすためのものすべて。routing、entrypoint、global styles、providers」で、
`app/layouts` `app/providers` のようにマークアップや合成も持つ。以前の規則 (app は結線だけ、マークアップは shared へ) は
そこから意図的に狭めたもので、FSD を知る人には `app/providers` `app/layouts` が無いことが引っかかる。
また `AppLayout` (画面をまたぐ枠) を shared に置くと widgets を import できず、ヘッダーにデータを載せるときにスロット化の一手間が要った。

### 同居と分離

Next.js の `app` ディレクトリはルーティングの規約で、FSD の App 層とは別物。FSD 公式の Next.js 統合ガイドは 2 案を認めている。

| | 同居 (`src/app` 1 つ) | 分離 (`web/app` + `src/app`) **← 採用** |
|---|---|---|
| 形 | `src/app/` に `page.tsx` `books/*` と `_layouts/` `_providers/` `_styles/` を並べる。FSD の segment は Next の private folder (`_` 始まり) にしてルーティングから外す | `web/app/` に規約ファイルだけ、`src/app/` に FSD の segment だけ |
| 読みやすさ | URL ツリーと FSD の segment が混ざる。`_` で見分ける | Next の規約と FSD の層が物理的に分かれる。`web/app` を見れば URL ツリーだけ |
| 制約 | segment の中に `page.tsx` `layout.tsx` `route.ts` などの名前を置けない | 無し。`app` という名前のディレクトリが 2 箇所になる |
| Next の仕様 | 既定の形 | ルートに `app` があると `src/app` は無視される (Next 16 の src Folder の文書に明記)。競合しない |

分離を選んだのは、「`web/app` は結線だけ、`src/app` は組み立てを持つ」という役割の差を場所で表せるため。

### 移したもの

| 前 | 後 | 追従した参照 |
|---|---|---|
| `web/src/app/**` (Next の規約ファイル) | `web/app/**` | 無し (`@/` は `src/` のままなので import は変わらない) |
| `shared/layouts/AppLayout/` | `src/app/layouts/AppLayout/` | `web/app/layout.tsx` |
| `web/app/globals.css` | `src/app/styles/globals.css` | `web/app/layout.tsx`、`.storybook/preview.tsx`、`components.json` |

移さなかったもの: `FormPageLayout` (Page が中身として描く部品。FSD でも shared)、`GlobalNav` `FormField` (部品)、
`BookFilterProvider` (「絞り込む」操作の状態。`features/book-filter`)、`routes.ts` (URL を組む部品。shared)、
`next/font` とメタデータ (Next 固有なので Root Layout に残す)。`providers/` はアプリ全体の Provider が出るまで作らない。

### React Router のとき

library mode では規約ディレクトリが無いので `src/app/` がルート定義 (`routes/`) と起点 (`entrypoint/`) も持ち、`web/app` に当たるものは無い。
framework mode は Remix 系のファイルベースで、Next と同じく規約ディレクトリを `src/` の外に置いて分ける。

---

## 7. `features` を `entities` に改名し、features を操作 (動詞) の層にする (確定済み)

規則は conventions の §1 の表と、features / entities / widgets の節にある。ここには経緯と対応表を残す。

### なぜ

以前の規則は `features/{domain}` を業務ドメインの単位 (型・通信・表示) にしていた。これは FSD の `entities` に当たり、
FSD を知る人が読むと最初に引っかかる。また、複数ドメインをまたぐ操作 (本を読了にして進捗も動かす、など) の置き場が無く、
widgets (UI の合成) に無理に入れるか、必要な項目だけを詰め替える回避が要った (§2 の旧案 1)。
FSD の名前に揃え、動詞の層を用意することで、この 2 つが解消する。

### 対応表

| 以前 | いま | 中身 |
|---|---|---|
| `features/book` `features/book-note` `features/book-progress` `features/stats` | `entities/…` | 改名のみ。中身は変えない |
| 旧 `entities` (複数ドメインで共通に使う `UserAvatar` など。実物は無かった) | `entities/user` に吸収 | User も普通の entity。特別な意味は無くなる |
| `widgets` | `widgets` | 複数 entities の UI ブロック。操作の合成は features へ |
| (無し) | `features/{domain}-{action}` | ユーザーの操作。1 view に閉じないもの |
| `views` | `views` | 変わらず |

import の向き `app > views > widgets > features > entities > shared` は FSD の順そのままで、改名前から変わっていない。

### features に出したもの

「本の絞り込み」を `features/book-filter` に切り出した。状態 (`BookFilterProvider`、旧 `entities/book/providers`)、
ロジック (`filterBooks`、旧 `entities/book/lib`)、型 (`BookFilter`、旧 `entities/book/model.ts`)、入力欄 (`BookFilterField`、旧 `views/book-list/components`)
が 1 つの slice に揃う。

出す判断の決め手は寿命。条件を読むのは一覧だけだが、`web/app/books/layout.tsx` にマウントされて詳細をまたいで残る。
1 つの view に閉じていないので、entities (実体) に預けるより操作としての置き場を与えたほうが意味が通る。

他の操作 (読了トグル、本・メモ・進捗のフォーム) は 1 つの view でしか使わないので views のまま。FSD 自身が
「1 ページの操作は pages に置いてよい」としているので、features 層に入っているのが 1 つでも不自然ではない。

### FSD との対応 (改名後)

| FSD | このプロジェクト | 差 |
|---|---|---|
| entities (名詞) | entities | 同じ。entities 同士の import は許容する。FSD の `@x` 記法 (公開面の限定) は管理コストが大きいので使わない |
| features (動詞、再利用されるもの) | features | 同じ。slice 名を `{domain}-{action}` で揃える点だけ独自 |
| widgets | widgets | 同じ |
| pages | views | 名前だけ (Next の `src/pages` と衝突するため) |
| app | `web/app` + `src/app` | §6 |
