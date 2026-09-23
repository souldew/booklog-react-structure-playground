// 統計ドメインの model。本やメモから導いた集計値で、それ自体は更新しない (読み取り専用)。

export type BookReadingStat = {
  /** YYYY-MM */
  month: string;
  /** その月に登録した本の冊数 */
  booksAdded: number;
  /** その月に登録した本の合計ページ数 */
  pagesAdded: number;
  /** その月に書いたメモの件数 */
  notesWritten: number;
};
