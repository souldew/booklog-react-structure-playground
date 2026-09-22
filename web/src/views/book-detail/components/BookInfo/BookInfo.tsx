import { BookStatusBadge } from "@/features/book/components/BookStatusBadge/BookStatusBadge";
import type { Book } from "@/features/book/model";
import { formatDate } from "@/shared/lib/formatDate";

type Props = {
  book: Book;
};

export function BookInfo({ book }: Props) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <dt className="text-muted-foreground">タイトル</dt>
      <dd className="font-medium">{book.title}</dd>
      <dt className="text-muted-foreground">著者</dt>
      <dd>{book.author}</dd>
      <dt className="text-muted-foreground">状態</dt>
      <dd>
        <BookStatusBadge status={book.status} />
      </dd>
      <dt className="text-muted-foreground">ページ数</dt>
      <dd className="tabular-nums">{book.totalPages}</dd>
      <dt className="text-muted-foreground">登録日</dt>
      <dd>{formatDate(book.createdAt)}</dd>
    </dl>
  );
}
