import Link from "next/link";

import type { BookNote } from "@/entities/book-note/model";
import { routes } from "@/shared/routes/routes";

type Props = {
  note: Pick<BookNote, "bookId" | "id">;
};

// メモ一覧の各メモに出す編集リンク。BookNoteList の actions に渡す。
export function BookNoteEditLink({ note }: Props) {
  return (
    <Link href={routes.bookNoteEdit(note.bookId, note.id)} className="hover:underline">
      編集
    </Link>
  );
}
