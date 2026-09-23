# 構造の検討メモ

[directory-conventions.md](directory-conventions.md) は確定した規則だけを書く。
ここには、規則を決めるときに考えたこと、判断待ちの案、規則を読み違えやすい点の解説を置く。
確定したら conventions に移し、ここからは消すか「確定済み」と印を付ける。

---

## 1. view は複数のドメインを知ってよい (確定済み)

規則は [directory-conventions.md](directory-conventions.md) の views の節にある。ここには読み違えた経緯だけ残す。

`views/book-detail` が `features/book` と `features/book-note` の両方を import しているのを見て、
「book 側が book-note を読んでいる」と読めた。実際に両方を知っているのは view であって、
`features/book` と `features/book-note` は互いを import していない。

見誤りの元は 2 つ。

- view 名の `{domain}` が「その view が知ってよいドメイン」に見える。実際は画面の主題を表すだけ
- features の節の「`{domain}` は views のフォルダ名の `{domain}` と対応させる」が import の条件に見える。実際は命名の指針

---

## 2. 画面を持たないドメインの置き場 (判断待ち)

例: 本の追加やコメントの投稿に反応してサンクスメッセージを出す gamification。
gamification という画面は無い。

### 置けるか

置ける。features は業務ドメインの単位で、views はそのドメインを URL に写したものにすぎない。
画面があるドメインは名前を揃える、というのが「対応させる」の意味で、画面の無いドメインを禁じていない。
ただし conventions の features の節は views から導かれるように読めるので、確定したら書き直す。

| 中身 | 置き場 |
|---|---|
| どの行動に感謝するか、何回目で特別な文言か、といったルールと型 | `features/gamification/model.ts` |
| サンクス表示の状態 | `features/gamification/providers/ThanksProvider.tsx`。寿命はアプリ全体なので `app/layout.tsx` にマウント |
| トーストの見た目 | `features/gamification/components/ThanksToast/` |
| 記録する処理 | `features/gamification/apis/functions/` か、通信が無ければ `lib/` |

呼ぶのは views。`views/book-form` の Server Action が成功時に記録関数を呼び、`views/timeline` のコメント投稿も同じ関数を呼ぶ。
両方のドメインを知っているのは views なので、import の向きと矛盾しない。

### 「登録してもらった本の情報を出す」要件が来たとき

gamification が `features/book` の `Book` 型を import すると兄弟 import になり禁止に触れる。逃げ方は 3 つ。

| 案 | 内容 | 判断 |
|---|---|---|
| 1. 必要な項目だけを自分の型で持つ | `type Contribution = { kind: "book-added"; bookTitle: string } \| { kind: "note-posted"; bookTitle: string; page: number }`。`Book` は知らず、views の Server Action が詰め替えて渡す | **推奨。** 表示がタイトル程度ならこれで足りる。gamification が「本」の構造に依存しない |
| 2. widgets に置く | `BookStatusBadge` を出す、`Book` 型をそのまま使う、など book の部品や型を丸ごと使いたくなったら、複数ドメインの合成なので `widgets/thanks/` に置く。widgets は features を複数 import できる | 部品まで使う段階で移る。docs の「基本は使わない」はまさにこの出番 |
| 3. `Book` 型を entities に上げる | entities は「複数のドメインで共通して使われ、名前があるもの」なので定義には当たる | book の型だけ entities に移り、apis や provider は features に残って book が 2 箇所に割れる。勧めない |

### 構成とは別の難所

`createBook` は成功すると詳細へ `redirect` するので、フォーム側の `useActionState` の状態は消える。
サンクスを詳細で出すには、Server Action で一時的な cookie を置いて `app/layout.tsx` の Server Component が読んで消す (flash) か、
`redirect("/books/7?thanks=book")` のようにクエリで運ぶか、のどちらかが要る。ディレクトリ構成ではなく Next の遷移の仕組みの話で、
どの案でも同じだけかかる。

### timeline について

コメントは本の入れ子ドメイン (BookNote に相当) なので、本を横断した一覧は新しいドメインではなく既存ドメインの別の切り口の画面。
view 名は `dashboard` と同じく CRUD に対応しない性質として `views/timeline` にし、中身は `features/book-note` を使う。

---

## 3. features を「ドメイン横断」の層に読み替える案 (判断待ち)

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

### 現状

命名は当面いまのまま (features / widgets / entities) を維持する。

---

## 4. ヘッダーの置き場 (確定済みの規則の解説)

規則は conventions の widgets の節「静的なルートへのリンクだけで済むなら shared で足りる」。

### なぜ shared でよいか

ヘッダーが持つ知識は「`/books` というリンクを出す」だけで、Book の型もデータも業務ルールも使わない。
**URL はドメインの持ち物ではなく app の持ち物**で、`features/book` は自分が `/books` にあることを知らない
([screens.md §3](screens.md) が URL → view の写像を持つ)。ドメインの名前と URL の語が一致するのは同じ業務の語彙を使うからで、
URL がドメインに属するからではない。

features に置くと、`/dashboard` `/books` `/settings/profile` へのリンクで複数ドメインの URL を 1 つの features が知ることになり、
合成になる。合成が要るなら widgets、要らないなら shared。

| ヘッダーの中身 | 置き場 |
|---|---|
| 静的なリンクだけ | shared (または app のレイアウトにベタ書き) |
| ログインユーザーの名前やアバター | widgets。entities の user を合成 |
| 未読メモの件数バッジ | widgets。features の値を合成 |

パスは `shared/routes/routes.ts` の関数 (`routes.bookDetail(id)` など) にまとめてあり、views の `Link` も Server Action の
`redirect` `revalidatePath` もヘッダーもここから取る (確定済み。規則は conventions の shared の節)。
ドメインの slice (features) がリンクを出すときも、URL の形を書かずにこの関数を呼ぶ。`BookNoteList` の編集リンクが最初の例。

### shared 版の構成 (現状)

`app/layout.tsx` は html / body、フォント、globals.css だけを持ち、マークアップは shared に出してある
(app の節の「マークアップもロジックも書かない」に沿う形)。

```
app/layout.tsx                          html / body、フォント、globals.css、<AppLayout> を呼ぶだけ
shared/layouts/AppLayout/               ヘッダー + <main> の骨格。children を受け取る。story あり
shared/components/GlobalNav/            リンクの一覧 (NAV_LINKS)。usePathname で現在地を強調 ("use client")。story あり
shared/routes/routes.ts                 パス関数。ナビのリンク先もここから取る
```

現在地の判定は `GlobalNav` の中にある。`/books` のリンクは `/books/2` のような下の階層でも現在地とし、`/` だけは完全一致にする。
強調は `aria-current="page"` と文字色で、story の play は `aria-current` で判定を見る。

`GlobalNav` の story は `parameters.nextjs.navigation.pathname` で現在地を切り替える。
`usePathname` を使うので `.storybook/preview.tsx` の `parameters` に `nextjs: { appDirectory: true }` を入れてある。

### widgets に移す場合の構成

ユーザー情報を載せるとき。`AppLayout` は shared なので widgets を import できず、ヘッダーの中身をスロットで受ける形に変える。

```
app/layout.tsx                                        <AppLayout header={<Suspense fallback={<GlobalHeaderSkeleton />}><GlobalHeaderContainer /></Suspense>}>
widgets/global-header/components/GlobalHeader/        Presentational。shared の GlobalNav と entities の UserAvatar を合成
widgets/global-header/components/GlobalHeader/GlobalHeaderContainer.tsx   fetchCurrentUser して GlobalHeader へ
widgets/global-header/components/GlobalHeaderSkeleton/
entities/user/                                        User 型、fetchCurrentUser、UserAvatar
shared/layouts/AppLayout/                             header をスロットで受ける
shared/components/GlobalNav/                          変えない
```

import の向きは `app > widgets > entities > shared` の一方向で、shared の `GlobalNav` と `AppLayout` は widgets の存在を知らない。
将来 `features/book-note` の未読件数を足すときも `GlobalHeader` が並べるだけで、`GlobalNav` は変わらない。
静的なリンクだけの間は shared 版のままにし、データが要る部品が出た時点でこの形に移す。
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
features/book/apis/functions/updateBook.ts   PATCH /books/:id を叩いて Book を返すだけ
views/book-form/actions/updateBook.ts        検証 → features の updateBook → revalidatePath → redirect
views/book-list/actions/updateBookStatus.ts  features の updateBook → revalidatePath
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
段階 3 で足した 3 本はそれぞれ別のエンドポイントで、ラッパーを features に置いても呼ぶのは Server Action 1 本ずつになる。
つまり「重複が消える」効用はまだ 1 箇所分しかなく、増えたのは「`apis/functions/` に通信だけの関数と画面の都合を持つ関数が同居する」件数のほう
(`fetchXxx` 4 本、Server Action 6 本)。

分けるなら今が機械的に済む最後の機会で、段階 4 (`/dashboard`) は取得だけなので Server Action は増えず、段階 5 (`/settings`) で 2 本増える。
現状は分けずに据え置き。
