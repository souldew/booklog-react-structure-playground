"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { Book, BookStatus } from "@/entities/book/model";
import { filterBooks } from "@/features/book-filter/lib/filterBooks";
import { useBookFilter } from "@/features/book-filter/providers/BookFilterProvider";
import type { ActionResult } from "@/shared/apis/actionResult";

import { BookRow } from "../BookRow/BookRow";

type Props = {
  books: Book[];
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<ActionResult>;
};

// 絞り込みは Provider の条件でクライアント側にかける。
// 更新のきっかけ (Server Action) は props で受け取り、自分では通信しない。
export function BookRows({ books, onChangeStatus }: Props) {
  const { filter } = useBookFilter();
  const visible = filterBooks(books, filter);

  return (
    <TableBody>
      {visible.length === 0 ? (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            該当する本がありません
          </TableCell>
        </TableRow>
      ) : (
        visible.map((book) => <BookRow key={book.id} book={book} onChangeStatus={onChangeStatus} />)
      )}
    </TableBody>
  );
}
