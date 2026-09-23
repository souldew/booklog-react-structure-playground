// BookProgress ドメインの model。Book の中の入れ子ドメインで、Book と 1:1。
// 独自の id を持たず bookId で引く。これが URL 側で /books/[bookId]/progress に [id] が付かない理由
// (docs/backend.md §3、docs/screens.md §2)。

export type BookProgress = {
  bookId: string;
  currentPage: number;
  /** ISO 8601 */
  updatedAt: string;
};
