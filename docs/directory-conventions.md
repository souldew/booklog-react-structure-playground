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
例外は `constants` と `types` で、1 ファイルで済むうちは `constants.ts` `types.ts` として直下に置いてよい。
増えたら `constants/` `types/` のディレクトリに昇格させる。

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
| `apis/` | API 呼び出し。1 エンドポイント 1 ファイル | `api` |
| `components/` | コンポーネント | `ui` |
| `layouts/` | 骨格。`children` を受け取る | `ui` |
| `pages/` | 画面の骨格と組み立て | `ui` |
| `hooks/` | フック | `model` |
| `providers/` | Context の Provider と、それを読むフック | `model` |
| `types/` | 型 | `model` |
| `constants/` | 定数 | `model` |
| `lib/` | 純粋関数 | `lib` |
| `fixtures/` | story やテストで使うデータ | — |

足りなければ、内容を表す名前のディレクトリを追加してよい (shared の `routes/` `config/` など)。

### ディレクトリを切るかフラットに置くか

| カテゴリ | 方針 |
|---|---|
| `components/` `layouts/` | 常にディレクトリ。1 ファイルだけでも切る |
| `pages/` | 常にフラット |
| それ以外 | 原則フラット。数が多くなったらディレクトリへの昇格を考える |

### コンポーネント 1 つの内部

1 ディレクトリ = 1 コンポーネント。役割で分けるときのファイル名は次の表に揃える。
ただし 4 種類をすべて作ることは求めない。1 ファイルが長くなり過ぎたときに、この名前で分ける。

| 種別 | ファイル名 | 役割 | story |
|---|---|---|---|
| Presentational | `Xxx.tsx` | 描画する。通信しない (context は読んでよい) | 書く |
| Skeleton | `XxxSkeleton.tsx` | ローディング中の見た目。独立したコンポーネントとして扱う | 書く |
| Container | `XxxContainer.tsx` | サーバーでデータを取得する、またはスロットへ注入する | 書かない |
| Client Container | `XxxClientContainer.tsx` | クライアントで通信する (`useQuery` / `useMutation`) | 書かない |

Presentational と Container の境界は「通信するか」で引く。context を読むだけなら Presentational のままでよい。
`useMutation` はレンダーだけなら通信しないが、内包すると story から差し替えられないので Presentational には置かず、
実行のきっかけは props で受け取る。

Skeleton は基本、別のディレクトリにする。

コンポーネントの下に `components/` や `hooks/` を再帰的に切らない。
内側でだけ使う hook も slice の `hooks/` に置き、`components/` から import する。
再帰を許すのは `shared` だけ (前述)。

### 状態と通信

Provider と、それを読む `useContext` のフックはセットなので、両方を `providers/` に置く。
Context 以外の状態管理 (zustand など) を入れる場合は、必要になった時点でディレクトリを切る。

`apis/` は 1 エンドポイント 1 ファイル。base URL、ヘッダー、エラーレスポンスの変換など
全エンドポイントに共通する部分は `shared/apis/` に置く。
サーバーで呼ぶ API とクライアントで呼ぶ API の区別は、必要になってから決める。

### 型の置き場

1 ファイルで済むうちは slice 直下に `types.ts`、増えたら `types/` ディレクトリ。
API レスポンスの型と画面で使う型は分ける。

### 命名

| 対象 | 形式 | 例 |
|---|---|---|
| slice 名・カテゴリ名 | kebab-case | `user-suspense-list` `components` |
| コンポーネント | PascalCase | `UserListPage.tsx` |
| それ以外のファイル | camelCase | `useUserFilter.ts` `filterUsers.ts` |
| shadcn 管理下 | CLI の流儀に従う | `components/ui/table.tsx` |

### story とテスト

実装とコロケーションする。`*.test.ts` は node、story は browser で動かす。
Container の story は書かず、msw も使わない。story は Presenter だけで完結させる。
