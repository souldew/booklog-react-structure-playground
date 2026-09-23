import Link from "next/link";

import type { RecentBookNote } from "@/entities/book-note/model";
import { formatDate } from "@/shared/lib/formatDate";
import { routes } from "@/shared/routes/routes";

type Props = {
  notes: RecentBookNote[];
};

// 本を横断した最近のメモ。1 冊のメモ一覧 (entities/book-note の BookNoteList) と違い、どの本のメモかを先頭に出す。
// 本文は 2 行で切る。全文は本のメモ一覧で読む。
export function RecentBookNoteList({ notes }: Props) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">メモはまだありません</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {notes.map((note) => (
        <li key={note.id} className="space-y-1 p-3 text-sm">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              href={routes.bookNotes(note.bookId)}
              className="font-medium text-foreground hover:underline"
            >
              {note.bookTitle}
            </Link>
            <span>ページ {note.page}</span>
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <p className="line-clamp-2 whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
