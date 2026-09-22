import type { BookNote } from "@/features/book-note/model";
import { formatDate } from "@/shared/lib/formatDate";

type Props = {
  notes: BookNote[];
};

// 詳細の中にネストした一覧。メモには詳細画面が無いので、本文をここに全部出す。
export function BookNoteList({ notes }: Props) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">メモはまだありません</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {notes.map((note) => (
        <li key={note.id} className="space-y-1 p-3 text-sm">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>ページ {note.page}</span>
            <span>{formatDate(note.createdAt)}</span>
          </div>
          <p className="whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
