import { notFound } from "next/navigation";

import { fetchBookNotes } from "../../apis/functions/fetchBookNotes";
import { BookNoteList } from "./BookNoteList";

type Props = {
  bookId: string;
  showEditLink?: boolean;
};

// 本のメモを取得して Presentational に渡す。views/book-detail と views/book-note-list の両方から呼ぶ。
export async function BookNoteListContainer({ bookId, showEditLink }: Props) {
  const notes = await fetchBookNotes(bookId);
  if (!notes) notFound();
  return <BookNoteList notes={notes} showEditLink={showEditLink} />;
}
