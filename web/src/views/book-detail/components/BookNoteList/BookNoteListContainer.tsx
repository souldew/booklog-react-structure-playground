import { notFound } from "next/navigation";

import { fetchBookNotes } from "@/features/book-note/apis/fetchBookNotes";

import { BookNoteList } from "./BookNoteList";

type Props = {
  bookId: string;
};

export async function BookNoteListContainer({ bookId }: Props) {
  const notes = await fetchBookNotes(bookId);
  if (!notes) notFound();
  return <BookNoteList notes={notes} />;
}
