// BookNote ドメインの model。Book の中の入れ子ドメインで、Book と 1:N。

export type BookNote = {
  id: string;
  bookId: string;
  page: number;
  body: string;
  /** ISO 8601 */
  createdAt: string;
};

// 本を横断して並べるときのメモ。どの本のメモかを示すためにタイトルを持つ。
// Book 型そのものは持たない。features/book を import すると兄弟 import になるため、必要な項目だけを自分の型で持つ。
export type RecentBookNote = BookNote & {
  bookTitle: string;
};
