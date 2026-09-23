import Link from "next/link";

import { formatDate } from "@/shared/lib/formatDate";
import { routes } from "@/shared/routes/routes";

import type { BookNote } from "../../model";

type Props = {
  notes: BookNote[];
  /** 1 件ごとに編集画面へのリンクを出す。メモ一覧の画面で使い、本の詳細では出さない */
  showEditLink?: boolean;
};

// メモの一覧。メモには詳細画面が無いので、本文をここに全部出す。
// 本の詳細 (views/book-detail) とメモ一覧 (views/book-note-list) の両方から使うので features に置く
// (同じドメインの複数の view で使うものは features。docs/directory-conventions.md)。
// 編集画面の URL は shared/routes から取る。URL の形をここに書かないため。
export function BookNoteList({ notes, showEditLink = false }: Props) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">メモはまだありません</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {notes.map((note) => (
        <li key={note.id} className="space-y-1 p-3 text-sm">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>ページ {note.page}</span>
            <span>{formatDate(note.createdAt)}</span>
            {showEditLink && (
              <Link
                href={routes.bookNoteEdit(note.bookId, note.id)}
                className="ml-auto hover:underline"
              >
                編集
              </Link>
            )}
          </div>
          <p className="whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
