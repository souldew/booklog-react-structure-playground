"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { BookStatusBadge } from "@/features/book/components/BookStatusBadge/BookStatusBadge";
import type { Book, BookStatus } from "@/features/book/model";
import type { ActionResult } from "@/shared/apis/actionResult";
import { routes } from "@/shared/routes/routes";

type Props = {
  book: Book;
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<ActionResult>;
};

// 一覧のインライン更新は行単位で pending / error を持つ (docs/backend.md §1)。
export function BookRow({ book, onChangeStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const isFinished = book.status === "finished";
  const nextStatus: BookStatus = isFinished ? "reading" : "finished";

  const handleToggle = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await onChangeStatus(book.id, nextStatus);
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <TableRow data-pending={isPending || undefined} className="data-pending:opacity-60">
      <TableCell>
        <Link href={routes.bookDetail(book.id)} className="underline-offset-4 hover:underline">
          {book.title}
        </Link>
      </TableCell>
      <TableCell>{book.author}</TableCell>
      <TableCell>
        <BookStatusBadge status={book.status} />
      </TableCell>
      <TableCell className="text-right tabular-nums">{book.totalPages}</TableCell>
      <TableCell className="space-x-2 whitespace-nowrap">
        <Button variant="outline" size="sm" disabled={isPending} onClick={handleToggle}>
          {isFinished ? "読書中に戻す" : "読了にする"}
        </Button>
        {error && (
          <span className="text-xs text-destructive" role="alert">
            更新に失敗しました: {error}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
