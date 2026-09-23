# 画面と URL

このアプリが持つ画面の一覧と、view への写像。
URL の切り方と view 名の付け方は [directory-conventions.md](directory-conventions.md) に従い、
そこから外れる判断はこの文書の各節に根拠を書く。

---

## 1. URL 一覧

| URL | 性質 | 担当する論点 |
|---|---|---|
| `/dashboard` | `dashboard` | 複数ドメイン横断。CRUD に対応しない性質 |
| `/books` | `list` | コレクション。絞り込みとインライン更新 |
| `/books/new` | `form` | **取得しない**組み立て層 |
| `/books/[bookId]` | `detail` | メンバー。中にネストした一覧を持つ |
| `/books/[bookId]/edit` | `form` | **取得する**組み立て層 |
| `/books/[bookId]/notes` | `list` | ネストしたコレクション |
| `/books/[bookId]/notes/new` | `form` | 親 id を持つ作成 |
| `/books/[bookId]/notes/[noteId]/edit` | `form` | ネストした編集 |
| `/books/[bookId]/progress` | `form` | ネストした**単一リソース** |
| `/settings/profile` | `settings` | 静的セグメントによるタブ |
| `/settings/notifications` | `settings` | 同上 |

`/` は `/dashboard` へのリダイレクトにする。

メモには詳細画面を作らない。一覧に本文が収まるため、`detail` を持つ理由が無い。
**CRUD を機械的に全部作らない**例としてそのままにしておく。

---

## 2. 単数形と複数形

同じ階層に、同じ形の URL で意味が違うものを並べてある。

```
/books/11/notes       複数形 → コレクション   → 一覧。[noteId] が付く
/books/11/progress    単数形 → 単一リソース   → 1件の編集。id が付かない
```

進捗は本1冊につき1つしかないので、一覧も `[id]` も存在しない。
ディレクトリ構造だけでこの違いが読める状態を保つ。

```
app/books/[bookId]/
├── notes/
│   ├── page.tsx                    一覧
│   ├── new/page.tsx
│   └── [noteId]/edit/page.tsx      動的セグメントがある
└── progress/
    └── page.tsx                    動的セグメントが無い
```

`/settings/notifications` は複数形だが、通知リソースのコレクションではなく
設定の区分なので `[id]` が付かない。**セクション名は単数化せず URL の語をそのまま使う。**

---

## 3. view への写像

画面は `views/{domain}-{detail}-{suffix}/` に置く。`{domain}` の決め方は
[directory-conventions.md](directory-conventions.md) の views の節に従う。

このリポジトリでの適用は次のとおり。

| | 適用 |
|---|---|
| 入れ子のドメイン | Book の中に BookNote と BookProgress がある。`book-note-list` `book-note-form` `book-progress-form` が独立したドメインとして名前を持つ |
| `{suffix}` | §1 の性質が `list` `detail` `form` のときだけ付ける。`dashboard` `settings` は CRUD に対応しないので付けない |

| URL | view | ページコンポーネント |
|---|---|---|
| `/dashboard` | `dashboard` | `DashboardPage` |
| `/books` | `book-list` | `BookListPage` |
| `/books/new` `/books/[bookId]/edit` | `book-form` | `BookFormPage` |
| `/books/[bookId]` | `book-detail` | `BookDetailPage` |
| `/books/[bookId]/notes` | `book-note-list` | `BookNoteListPage` |
| `.../notes/new` `.../notes/[noteId]/edit` | `book-note-form` | `BookNoteFormPage` |
| `/books/[bookId]/progress` | `book-progress-form` | `BookProgressFormPage` |
| `/settings/profile` | `settings-profile` | `SettingsProfilePage` |
| `/settings/notifications` | `settings-notifications` | `SettingsNotificationsPage` |

`book-form` と `book-note-form` は、**1 view が作成と編集の2画面を受け持つ**。
組み立て層だけが2つに分かれる。

```
views/book-form/pages/
├── BookFormPage.tsx                  骨格。両方で共有する
├── BookNewFormPageContainer.tsx      /books/new から呼ぶ
└── BookEditFormPageContainer.tsx     /books/[bookId]/edit から呼ぶ
```

---

## 4. ドメインモデル

SQLite に永続化する。テーブル定義とエンドポイントは [backend.md](backend.md) にある。

ここに書くのは **`web` 側のドメイン型**で、生成された API 型とは別物になる。
両者の変換は mapper が持つ。

### Book

| フィールド | 型 | 備考 |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | |
| `author` | `string` | |
| `status` | `'unread' \| 'reading' \| 'onHold' \| 'finished'` | 一覧のトグルで更新する。API の `on_hold` は mapper で `onHold` になる |
| `totalPages` | `number` | |
| `createdAt` | `string` | ISO 8601 |

### BookProgress

Book と 1:1。単一リソースにする根拠。Book の中の入れ子ドメインで、BookNote と同じ形。

| フィールド | 型 |
|---|---|
| `bookId` | `string` |
| `currentPage` | `number` |
| `updatedAt` | `string` |

### BookNote

Book と 1:N。コレクションにする根拠。

| フィールド | 型 |
|---|---|
| `id` | `string` |
| `bookId` | `string` |
| `page` | `number` |
| `body` | `string` |
| `createdAt` | `string` |

### 設定

| | フィールド |
|---|---|
| `ProfileSettings` | `displayName` / `bio` |
| `NotificationSettings` | 通知種別ごとの真偽値 |

どちらもユーザーにつき1つで、`[id]` を持たない。

---

## 5. Suspense 境界

データに依存しない骨格は境界の外、依存する部分だけ内側に置く。

| 画面 | 境界の外 | 境界の内 |
|---|---|---|
| `/dashboard` | カードの枠・見出し | 各パネルの中身（**パネルごとに独立**） |
| `/books` | ツールバー・絞り込み欄・テーブルヘッダー | 行 |
| `/books/[bookId]` | 本の見出し | 書誌情報 / メモ一覧（**別々の境界**） |
| `/books/new` | 全部 | **なし** |
| `/books/[bookId]/edit` | フォームの枠 | フィールド |
| `/books/[bookId]/notes` | 見出し・追加リンク | メモの一覧 |
| `/books/[bookId]/notes/new` | 全部 | **なし** |
| `/books/[bookId]/notes/[noteId]/edit` | フォームの枠 | フィールド |
| `/books/[bookId]/progress` | フォームの枠 | フィールド。**作成が無いので常に境界がある** |

`/books/new` と `/books/[bookId]/edit` を並べると、**作成側には Container も Suspense も
無い**ことが差分として現れる。これが段階 2 の主眼。

`/books/[bookId]/progress` は単一リソースなので new に相当する画面が無く、Container も 1 つだけになる。
`book-form` `book-note-form` が `pages/` に New と Edit の 2 つの Container を持つのと並べると、
**複数形と単数形の差が `pages/` のファイル数に出る。** これが段階 3 の主眼。

`/dashboard` はパネルごとに境界を分ける。速いパネルから順に出るので、
境界の粒度の効果が一番見える画面になる。パネルは「読書中の本」(本 + 進捗の合成、api は 1200ms + 200ms)、
「最近のメモ」(1500ms)、「月別の記録」(300ms) の 3 つで、統計 → 本 → メモの順に出る。

取得は他の画面と同じく Server Component で行う ([tech-stack.md §4](tech-stack.md))。骨格と 3 つの Skeleton が先に届き、
取得が終わったパネルから順にストリーミングで中身に差し替わる。`DashboardPageContainer` が `Suspense` を 3 つ置き、
取得する Container をスロットに注入する形は `BookListPageContainer` と同じ。

失敗の受け口は `web/app/dashboard/error.tsx` で、**境界はパネル単位ではなく画面単位**になる。
1 枚でも失敗すれば画面全体がエラー表示に置き換わる。

---

## 6. Provider の置き場所

| 対象 | 定義 | マウント | 寿命 |
|---|---|---|---|
| 本の絞り込み条件 | `features/book-filter/providers/` | `web/app/books/layout.tsx` | セクション |

条件を読むのは `book-list` だけだが、詳細をまたいで残すためにレイアウトにマウントする。
view より寿命が長い操作の状態なので、view ではなく「絞り込む」操作の slice `features/book-filter` に置く。

一覧 → 詳細 → 一覧 と往復しても条件が残ることを確かめる。
アプリ内のリンクはすべて `next/link` にする。フル再読み込みでは残らないため。

絞り込みの**入力欄を置くのは `BookListPage`** であってレイアウトではない。
レイアウトに置くと詳細画面にも無関係な入力欄が出るうえ、入力欄と表が別の層に分かれて
story で繋がりを検証できなくなる。

---

## 7. ナビゲーション

| 位置 | 内容 |
|---|---|
| グローバル（ルートのレイアウト） | `/dashboard` `/books` `/settings/profile` へのリンク |
| `/books` 配下のレイアウト | 絞り込み条件の Provider のみ。UI は持たない |
| `/settings` 配下のレイアウト | タブバー（`/settings/profile` `/settings/notifications`） |

`/settings` 配下のタブバーがレイアウトにあることで、**タブであることを view 側が
知らなくてよい**状態になる。`settings-notifications` は自分がタブの中身だと知らない。
