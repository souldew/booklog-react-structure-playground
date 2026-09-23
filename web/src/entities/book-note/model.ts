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
// Book 型そのものは持たず、必要な項目だけを自分の型で持つ。entities/book への依存を「タイトルの文字列」に絞るため
// (entities 同士の import は許されているが、本の構造に依存しないほうが変更に強い)。
export type RecentBookNote = BookNote & {
  bookTitle: string;
};
