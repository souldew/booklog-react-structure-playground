# React アプリのディレクトリ規約

Feature-Sliced Design (FSD) をベースに、業務ドメインのレベルで構造を切れるようにしたパターン。
フォルダ構成は FSD と同じになるが、中身の定義を業務ドメインに置くため、各層の意味は少しずつ異なる。

## 前提

- React で、データ取得を伴う画面を持つアプリ
- ルーティングは Next.js App Router と React Router のどちらでも成立する。違いは `app/` の結線の書き方だけ
- アプリケーションコードは `src/` に置き、`@/` が `src/` を指す alias を持つ
- shadcn/ui のように「コードをコピーしてくる」ライブラリを使う

---

## 1. 層と import の向き

import は次の向きにだけ許す。

```
app > views > widgets > features > entities > shared > components/ui
```

同じディレクトリ内のトップの兄弟同士では import しない。
たとえば `features/user` と `features/book` があるとき、user 側で book を import しない。
両方が要るものは、両方を import できる上の層 (views や widgets) に置く。
entities だけは例外で、兄弟同士の import を許容する (後述)。

| 層 | 置くもの |
|---|---|
| `app/` | ルーティングに接続するだけの薄い層 |
| `views/{domain}-{detail}-{suffix}/` | 1 画面。URL に対応する |
| `widgets/{name}/` | 複数のドメインを合成するもの。基本は使わない |
| `features/{domain}/` | 業務ドメイン単位。同じドメインの複数の view で使うもの |
| `entities/{name}/` | 複数のドメインで共通して使われ、それ自体に名前があるもの |
| `shared/` | 業務ドメインを持たない部品 |
| `components/ui/` | shadcn CLI が生成したコード |

必須なのは `app/` と `views/` だけ。他の層は該当物が出るまで作らない。
画面が数枚のうちは views だけで済み、共有が出た時点で features や shared を足す。

---

## 2. 各層

### app

URL と画面を結線し、アプリ全体を初期化するだけの薄い層。マークアップもロジックも書かない。
置くのはエントリ、ルート定義、アプリ全体の Provider のマウント、グローバル CSS の 4 つ。

ルートから画面へは `<XxxPageContainer />` を 1 行呼ぶだけにし、URL パラメータはここで解決して
素の値を渡す。Provider のマウント位置は、生かしたい寿命 (アプリ全体 / セクション / 画面) に合わせて決める。

| ルーター | 結線の書き方 |
|---|---|
| Next.js App Router | `app/{segment}/page.tsx` が 1 ルート。`layout.tsx` がセクション寿命の Provider の置き場 |
| React Router (library mode) | `app/routes.tsx` にルート定義を書き、`element` に Container を渡す。`children` を持つ layout route がセクション寿命の Provider の置き場 |
| React Router (framework mode) | `app/routes/*.tsx` の route module が 1 ルート。default export は Container を返すだけ、`loader` / `action` は `apis/` に委譲するだけにする。`app/` の場所は `appDirectory` で `src/app` に向ける |

```tsx
// Next.js: app/users/[id]/page.tsx
export default async function Page({ params }: PageProps<'/users/[id]'>) {
  const { id } = await params
  return <UserDetailPageContainer id={id} />
}

// React Router (library mode): app/routes.tsx
{ path: '/users/:id', element: <UserDetailPageContainer /> }
```

### views

URL、つまり画面に対応する。フォルダ名は `{domain}-{detail}-{suffix}` の構成で、
suffix は Rails のアクションに対応する語を使う。

| Rails のアクション | suffix | 備考 |
|---|---|---|
| index | `list` | |
| show | `detail` | |
| new / edit | `form` | 2 つの URL を 1 つの view で受け持つ |
| 単数リソース (resource) の show | なし | suffix を省略する |

`{domain}` は、その画面が扱う業務ドメインの名前。URL とおおむね対応するが、
URL のセグメントから形式的に決まるものではなく、業務ロジックの区切りで決める。
`{detail}` は、同じドメインに同じ suffix の画面が複数あるときの区別で、無ければ省略する。

ドメインは入れ子になることがある。Course の中に CourseLesson がある場合、CourseLesson は
それ自体が 1 つのドメインなので、view 名は `course-lesson-detail`、ページは `CourseLessonDetailPage` になる。
URL が `/course/11/courseLesson/3` であっても、セグメントを連結した `course-course-lesson-detail` にはしない。
逆に URL が `/course/11/lesson/3` で `lesson` という語しか現れなくても、業務上のドメインが CourseLesson なら
view 名は `course-lesson-detail` にする。URL の語を短くしているだけで、ドメインの名前が変わるわけではない。

new と edit は最初から同じコンポーネントを使い回す可能性が高いので、同じ view の中で完結させる。
分けてしまうと「フォーム」という大きな単位が features に流れてしまう。
大きく異なるようになったら、その時点でディレクトリを切ればよい。

`pages/` には `XxxPage` `XxxPageContainer` と story を置く。
new と edit を 1 つの view で受ける場合は `UserNewPageContainer` `UserEditPageContainer` のように
Container を分け、`pages/` にフラットに並べる。

`layouts/` の置き場は他のコンポーネントと同じ基準で決める。
その view でしか使わないなら views、同じドメインの複数の view で使うなら features。

層の名前を `pages/` にしないのは、Next.js が `src/pages/` を Pages Router として拾うため。

### widgets

基本的には使わない層で、使わずに済むようにする。
Header に entities の user 情報を載せるなど、複数のドメインを合成する必要が出たときだけここに定義する。
静的なルートへのリンクだけで済むなら shared で足りる。

### features

業務ドメイン単位で区切り、`features/{domain}` にまとめる。
views の list と detail で同じものを使う、といった場合に置く。
`{domain}` は views のフォルダ名の `{domain}` と対応させるのが原則。

`features/{domain}` の下に `{sub}` は切らない。本当に大きくなったら考えるが、原則は無いはず。

何を置くかは他のカテゴリと同じ基準に従う。そのドメインだけで使うなら features、
複数のドメインで共通なら entities。`apis/` も同じ。

### entities

複数のドメインで共通して使われるものを定義する。`UserAvatar` など。
複数のドメインにまたがるということは、それ自体に名前があるものであるはず。
型と UI が基本。`fixtures/` も、複数のドメインで使い回すならここに置く。

entities 同士の import は許容する。owner が user の型を参照する、といった形をそのまま書いてよい。
FSD には公開面を `@x` で限定する記法があるが、冗長で実装コストが高いので使わない。
ただし、上位の層 (features や widgets) で合成すれば済む場合は、そちらを優先する。

### shared

業務ドメインを持たない部品。
Button のようなプリミティブから、Dialog のようにプリミティブを組み合わせたものまで、
ドメインを持たないならここに置く。

作るディレクトリは縛らない。`components/` `hooks/` `lib/` のほか、`routes/` `config/` `apis/` などを
必要に応じて切る。

部品の内側でだけ使う部品や hook は、その部品の下に再帰的に置いてよい。

```
shared/components/DataTable/components   DataTable の中でしか使わない部品
shared/components/DataTable/hooks        DataTable の中でしか使わない hook
```

深さに上限は設けないが、1 段までを原則とする。2 段目が欲しくなったら、その部品が大きすぎる
合図なので、内側の部品を `shared/components/` 直下に出すことを先に考える。
複数の部品から使う hook は `shared/hooks` に置く。

shadcn のラップは `shared/components/Input/Input.tsx` が `components/ui/input` を包む形にする。

### components/ui

shadcn の ui を入れる。shadcn の既定のパスで、これ以外の alias も既定のままにする。
そのため `lib/utils` や `hooks` は既定の場所 (`src` 直下) に生成される。
気になるなら別のディレクトリに切ってもよい。

shadcn 製のコンポーネントは、外からのラップでは要件を満たせない場合にだけ直接編集する。
`shared/components` で薄くラップし、プロジェクトからはそちらを import するのが理想。
ただし、そこまで大きくないプロジェクトであれば直接使うことも許容する。

CLI が書く場所はファイル名も CLI の流儀に従い、story は書かない。

---

## 3. slice の中身

slice (`views/{page}` `features/{domain}` `entities/{name}` `widgets/{name}`) の中も、
slice を持たない `shared` の中も、同じ規約で並べる。

### slice 直下の形

slice の直下にはカテゴリのディレクトリだけを置く。
例外は `model` と `constants` で、1 ファイルで済むうちは `model.ts` `constants.ts` として直下に置いてよい。
増えたら `model/` `constants/` のディレクトリに昇格させる。

公開面としての `index.ts` は置かない。経由を強制する仕組みは作れるがコストが高く、
経由しない import が混ざると index の保守のほうが面倒になる。

### import のパス

参照先が同じ slice の中にあるかどうかで書き方を分ける。

- 同じ slice の中を参照するときは相対パスで書く
- 別の slice や別の層を参照するときは `@/` からの絶対パスで書く

```ts
// features/user/components/UserFilterField/UserFilterField.tsx
import { useUserFilter } from '../../providers/UserFilterProvider'          // 同じ slice の中
import { Input } from '@/components/ui/input'                             // 別の層
```

import 文を見ただけで、slice の内側で完結している参照か、外への依存かが読める。
slice をディレクトリごと移しても、内側の相対パスは壊れない。

### カテゴリ

既定のカテゴリは次の 10 個。層ごとに使えるカテゴリを限定はしない。

| カテゴリ | 置くもの | FSD の segment |
|---|---|---|
| `apis/` | API 境界。`functions/` `hooks/` `mappers/` の 3 つに分ける (後述)。`@/generated` を import してよい唯一のカテゴリ | `api` |
| `components/` | コンポーネント。1 ディレクトリ = story 1 ファイル。story の無い部品は付属品として親のディレクトリに置く (後述) | `ui` |
| `layouts/` | 骨格。`children` を受け取る | `ui` |
| `pages/` | 画面の骨格と組み立て | `ui` |
| `hooks/` | 2 つ以上のコンポーネントが使うフック。1 つしか使わないものはそのコンポーネントの付属品。生成 hook を包むものは `apis/hooks/` | `model` |
| `providers/` | Context の Provider と、それを読むフック | `model` |
| `model/` | 業務の知識。型、型を導く `as const`、zod スキーマ、業務ルールの値 | `model` |
| `constants/` | 画面の都合の値のうち複数箇所で使うもの。ラベルの辞書、共有する文言。1 箇所ならベタ書き。業務の値は入れず `model` に置く | `ui` |
| `lib/` | 純粋関数。生成型を知らないもの。生成型 ⇄ ドメイン型の変換は `apis/mappers/` | `lib` |
| `fixtures/` | story やテストで使うデータと、story が import する道具 (`expectStable` など) | — |

足りなければ、内容を表す名前のディレクトリを追加してよい (shared の `routes/` `config/` など)。

### ディレクトリを切るかフラットに置くか

| カテゴリ | 方針 |
|---|---|
| `components/` `layouts/` | 常にディレクトリ。1 ファイルだけでも切る |
| `pages/` | 常にフラット |
| `apis/` | 常に `functions/` `hooks/` `mappers/` に分ける。1 ファイルだけでも切る。空のディレクトリは作らない |
| それ以外 | 原則フラット。数が多くなったらディレクトリへの昇格を考える |

### コンポーネント 1 つの内部

1 ディレクトリ = 1 コンポーネント = story 1 ファイル。**ディレクトリと story は双方向に対応する。**
story を書きたい単位がコンポーネントであり、`components/` 直下のディレクトリには必ず story がある。
story の無い Presentational はコンポーネントではなく、後述の「付属品」として親のディレクトリに置く。

役割で分けるときのファイル名は次の表に揃える。
ただし 4 種類をすべて作ることは求めない。1 ファイルが長くなり過ぎたときに、この名前で分ける。

| 種別 | ファイル名 | 役割 | story |
|---|---|---|---|
| Presentational | `Xxx.tsx` | 描画する。通信しない (context は読んでよい) | 書く |
| Skeleton | `XxxSkeleton.tsx` | ローディング中の見た目 | 要件次第。単体で見たいなら書く |
| Container | `XxxContainer.tsx` | サーバーでデータを取得する、またはスロットへ注入する | 書かない |
| Client Container | `XxxClientContainer.tsx` | クライアントで通信する (`useQuery` / `useMutation`) | 書かない |

Presentational と Container の境界は「通信するか」で引く。context を読むだけなら Presentational のままでよい。
`useMutation` はレンダーだけなら通信しないが、内包すると story から差し替えられないので Presentational には置かず、
実行のきっかけは props で受け取る。

Skeleton の置き場は要件で決める。単体で story を見たいなら独立したコンポーネントとして別のディレクトリにし、
そうでなければ Presentational の付属品として同じディレクトリに `XxxSkeleton.tsx` で置く。
判断の基準は次の「付属品」と同じ。

#### 付属品

そのコンポーネントしか使わないものは、そのディレクトリの中にある。これを付属品と呼ぶ。
Container もこの見方では Presentational の付属品で、story を書かないのはそのため。

次の 3 つを**すべて**満たすものだけを付属品にする。1 つでも外れたら独立したコンポーネントであり、
ディレクトリと story を作る。

| 条件 | 外れる例 |
|---|---|
| 使う親が 1 つしかない | 一覧と詳細の両方で使う `BookStatusBadge` |
| 自分の状態を持たない。pending、error、空、variant のような「story で見せたい姿」が無い | 行単位の pending / error を持つ `BookRow` |
| 親の props をそのまま受け取るか、親が持つ値を分けて描くだけ | — |

| 付属品の種類 | 置き方 | 例 |
|---|---|---|
| 描画の切り出し | 親のディレクトリに置き、ファイル名は親名を頭に付ける | `BookRow/BookRowStatusCell.tsx` |
| hook | 親のディレクトリに置く。slice の `hooks/` には置かない | `BookRow/useBookRowToggle.ts` |

付属品はディレクトリの外から import しない。外から import された時点で付属品ではなくコンポーネント
(hook なら slice の `hooks/`) なので、昇格させる。`constants` の「1 箇所ならベタ書き、2 箇所で使ったら昇格」と同じ形。
slice の `hooks/` に置くのは、2 つ以上のコンポーネントが使う hook だけ。

付属品はディレクトリ直下にフラットに置き、**コンポーネントの下に `components/` や `hooks/` を再帰的に切らないことを推奨する。**
1 ディレクトリに付属品が 4、5 個並ぶなら、状態を持つものが隠れている可能性が高いので、
まず付属品の条件に照らして昇格させるものがないか見直す。ディレクトリを切るのは、それでも多いときの最後の手段。

やむを得ず切る場合の縛りは次のとおり。

- 入れ子は 1 段まで。付属品の付属品でさらに切らない
- 内側の `components/` は付属品の置き場なので story は書かない。「ディレクトリ ⇔ story」の規則は slice 直下の `components/` にだけ適用する
- 外から import しないという付属品の条件はそのまま効く。内側のディレクトリを外から参照した時点で slice の `components/` へ昇格させる

`shared` の部品は例外で、内側に再帰的に置いてよい (前述)。

### 状態と通信

Provider と、それを読む `useContext` のフックはセットなので、両方を `providers/` に置く。
Context 以外の状態管理 (zustand など) を入れる場合は、必要になった時点でディレクトリを切る。

### apis の内側

`apis/` は「通信するもの」ではなく「生成型を知ってよい場所」として切る。
mapper は純粋関数だが `@/generated/model` を import するので、ドメインの純粋関数を置く `lib/` ではなく
`apis/` の一部として扱う。これで `lib/` `components/` `hooks/` は `@/generated` を一切知らなくなる。

| サブディレクトリ | 置くもの | 生成型 | 呼ぶ側 |
|---|---|---|---|
| `functions/` | 生成クライアントを呼び、mapper を通してドメイン型を返す async 関数。Server Action もここ。1 エンドポイント 1 ファイルで、1 関数の通信は 1 回。複数のエンドポイントの合成は Container で行う | import する | Server Component の Container、`app/` の `loader` / `action` |
| `hooks/` | 生成された TanStack Query の hook を包み、`select` などで mapper を通してドメイン型を返す hook | import する | ClientContainer |
| `mappers/` | 生成型 ⇄ ドメイン型の純粋関数。副作用なし。テストは node で書く | 型だけ import する | `functions/` `hooks/` |

`functions/` は `fetchers` にすると更新系が収まらないので、この名前にしている。
`hooks/` は最初の ClientContainer ができるまで作らない。

base URL、ヘッダー、エラーレスポンスの変換など全エンドポイントに共通する部分は `shared/apis/` に置く。
`shared/apis/` はエンドポイントを持たないので、この 3 分割は適用せずフラットのままでよい。

### model と constants の線引き

「値を変えたときに、業務の人に聞かないと決められないか」で分ける。

| | 入るもの | 例 |
|---|---|---|
| `model` | 業務の知識。型と、型を導く元になる `as const` の値、zod スキーマ、スキーマが参照する上限値や既定値 | `Book` `BOOK_STATUSES` `MAX_NOTES_PER_BOOK` |
| `constants` | 画面の都合で決まる値のうち、**複数箇所で使うもの**。業務の意味を変えずに書き換えられるもの。**業務の値は入れない。`model` に置く** | `Record<BookStatus, string>` のラベル辞書、複数の画面で出す文言、1 画面の表示件数 |

1 箇所でしか使わない文言やラベルは、使うコンポーネントにベタ書きする。
constants に出すのは、2 箇所以上で同じ値を使い、片方だけ変わると困るものだけ。
「文言を全部 constants に集める」ことはしない。集めると、コンポーネントを読むときに毎回別ファイルを開くことになる。

`types` という名前にしないのは、型を導く `as const` の配列や zod スキーマのように、
型と値が同じ出典になるものを分けずに置くため。型だけのファイルに値が漏れる、という状態を作らない。

依存の向きは一方向にする。`constants` が `model` の型や値を参照するのはよい
（ラベル辞書に `satisfies Record<BookStatus, string>` を付ける、文言に上限値を埋め込む、など）。
`model` から `constants` は参照しない。参照したくなったら、その定数は業務ルールなので `model` に移す。

`model.ts` が大きくなって `model/` に昇格するとき、型を導かない業務定数は当面 `model/constants.ts` に置く。
slice 直下の `constants/` とは名前が重なるが、中身は「業務の値」と「画面の値」で重ならない。
概念ごとに割るかどうかは、大きくなった時点で考える。

API レスポンスの型（生成型）と画面で使う型（ドメイン型）は分ける。前者は `generated/`、後者は `model`。

### 命名

| 対象 | 形式 | 例 |
|---|---|---|
| slice 名・カテゴリ名 | kebab-case | `user-suspense-list` `components` |
| コンポーネント | PascalCase | `UserListPage.tsx` |
| それ以外のファイル | camelCase | `useUserFilter.ts` `filterUsers.ts` |
| story | 対象と同名 + `.stories.tsx` | `UserRow.stories.tsx` |
| テスト | 対象と同名 + `.test.ts` | `filterUsers.test.ts` |
| shadcn 管理下 | CLI の流儀に従う | `components/ui/table.tsx` |

### story とテスト

実装とコロケーションする。`*.test.ts` は node、story は browser で動かす。
Container の story は書かず、msw も使わない。story は Presenter だけで完結させる。

story とテストで使うデータは slice の `fixtures/` に置く (`features/book/fixtures/books.ts`)。
story やテストが import する道具も `fixtures/` に置く (`shared/fixtures/expectStable.ts` `shared/fixtures/stubFetch.ts`)。
Storybook の仕組みそのもの (ツールバー、全 story に効く decorator とその部品) は `web/.storybook/` に置き、`src/` には入れない。

`<tr>` や `<tbody>` を返すコンポーネントは、story の `decorators` で `Table` に包む。
props で受け取る関数は `storybook/test` の `fn()` を渡し、実装は import しない。

Page の story はスロットに取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
Skeleton からの切り替わりは `parameters.slots` にスロット名と Skeleton を宣言し、ツールバーの遅延で見る
([tech-stack.md §7](tech-stack.md))。Skeleton と中身を並べて比べるだけの story は書かない。切り替わりで見えるため。
