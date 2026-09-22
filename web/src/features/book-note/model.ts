// BookNote ドメインの model。Book の中の入れ子ドメインで、Book と 1:N。

export type BookNote = {
  id: string;
  bookId: string;
  page: number;
  body: string;
  /** ISO 8601 */
  createdAt: string;
};
