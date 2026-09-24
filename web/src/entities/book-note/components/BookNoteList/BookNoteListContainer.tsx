import { notFound } from "next/navigation";
import type { ComponentProps } from "react";

import { fetchBookNotes } from "../../apis/functions/fetchBookNotes";
import { BookNoteList } from "./BookNoteList";

type Props = {
  bookId: string;
  actions?: ComponentProps<typeof BookNoteList>["actions"];
};

// 本のメモを取得して Presentational に渡す。views/book-detail と views/book-note-list の両方から呼ぶ。
export async function BookNoteListContainer({ bookId, actions }: Props) {
  const notes = await fetchBookNotes(bookId);
  if (!notes) notFound();
  return <BookNoteList notes={notes} actions={actions} />;
}
