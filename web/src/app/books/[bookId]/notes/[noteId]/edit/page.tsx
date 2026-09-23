import { BookNoteEditFormPageContainer } from "@/views/book-note-form/pages/BookNoteEditFormPageContainer";

// ネストした編集。動的セグメントが 2 つある。
export default async function Page({ params }: PageProps<"/books/[bookId]/notes/[noteId]/edit">) {
  const { bookId, noteId } = await params;
  return <BookNoteEditFormPageContainer bookId={bookId} noteId={noteId} />;
}
