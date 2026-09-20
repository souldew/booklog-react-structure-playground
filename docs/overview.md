# このプロジェクトは何か

React アプリの **URL 設計と画面の分け方**を、動くアプリで確かめるための playground。

題材は読書管理 (booklog) だが、読書管理サービスとしての充実は目的ではない。
**設計上の判断がひと通り実物として現れること**を優先して画面を選んでいる。
実プロダクトではない。

---

## 指針の置き場所

構成の指針そのものは別リポジトリにある。このリポジトリはその**適用例**にあたる。

| 文書 | 場所 |
|---|---|
| ディレクトリ構成の指針 | `../react-suspense-playground/docs/directory-structure.md` |
| 画面と URL の設計 | `../react-suspense-playground/docs/screen-and-url-design.md` |

**指針はこちらに複製しない。** 二重管理になるため参照だけにとどめ、
適用した結果と指針から外した点だけをこのリポジトリの docs に書く。

将来どちらかに寄せる可能性はあるが、現時点では分離したままにする。

---

## 何を確かめるか

画面ごとに担当する論点を割り当ててある。**どの画面も、他では出ない判断を1つ以上持つ。**

| 論点 | 現れる場所 |
|---|---|
| 生成された API 型を features に持ち込まない | `web` 側の mapper |
| 更新後にキャッシュを無効化しないと一覧が古いまま | `/books` のトグルと `revalidatePath` |
| コレクションと単一リソースの書き分け | `/books/[bookId]/notes` と `/books/[bookId]/progress` |
| 画面の性質を CRUD から導かない | `/dashboard` `/settings/*` |
| URL のセグメント順と feature 名が一致しない | `/settings/notifications` → `notification-settings` |
| 作成と編集で URL を分ける | `/books/new` と `/books/[bookId]/edit` |
| 取得の有無が組み立て層に出る | 同上。作成側には Container が無い |
| 作成と編集で Presentational を共有する | `BookForm` |
| 一覧からの更新は `edit` ではない | `/books` の読了トグル |
| 詳細の中にネストした一覧を置く | `/books/[bookId]` |
| セクション寿命の Provider | `/books` の絞り込み条件 |
| Suspense 境界の粒度 | `/dashboard` のパネル |

画面の一覧と、それぞれの feature への写像は [screens.md](screens.md) にある。
API と DB の構成は [backend.md](backend.md) にある。

---

## 作る順序

1段階ごとに新しい判断が1つ増える並びにしてある。**途中で止めても、そこまでの論点は成立する。**

| | 追加するもの | 新しく確かめられること |
|---|---|---|
| 0 | `api` と SQLite、`/books` 系のエンドポイント | API 境界、型の生成と mapper |
| 1 | `/books` `/books/[bookId]` | list / detail、絞り込み Provider、インライン更新 |
| 2 | `/books/new` `/books/[bookId]/edit` | form の共有と、組み立て層に出る差 |
| 3 | `/books/[bookId]/notes` `/books/[bookId]/progress` | 複数形と単数形の対比 |
| 4 | `/dashboard` | 複数の Suspense 境界、`domains/` へのパネル集約 |
| 5 | `/settings/*` | タブ分割、レイアウトの責務 |

段階 2 が主目的。段階 1 はその前提を整えるためにある。

---

## スコープ外

デモとして作り込まないものを先に決めておく。

| | 扱い |
|---|---|
| 認証・認可 | 持たない。ユーザーは1人だけ存在する前提 |
| デプロイ | しない。ローカルで動けばよい |
| 検索・並び替えの実装品質 | 絞り込みは部分一致だけ。全文検索やインデックスは扱わない |
| レスポンシブ | 最低限。ブレークポイントの作り込みはしない |
| 画像 | 表紙画像は持たない。通信の関心を増やさないため |
| エラーハンドリングの網羅 | `error.tsx` は置くが、種類ごとの出し分けはしない |
| API の実装品質 | ページネーション・N+1・トランザクションは扱わない |

**永続化はスコープ内**にする。Next.js とは別プロセスの API を立て、SQLite に保存する。
指針の主張のうち、mapper・キャッシュ無効化・送信されない値といったものは
**API 境界が実在しないと検証できない**ため。理由と構成は [backend.md](backend.md) にある。

レイテンシは実際の値に寄せず、**ローディング表示を必ず目視できる**ように
API 側で遅延を持たせる。
