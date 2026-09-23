import { BookNoteListPageContainer } from "@/views/book-note-list/pages/BookNoteListPageContainer";

// 複数形 → コレクション → 一覧。下に [noteId] が付く (docs/screens.md §2)。
export default async function Page({ params }: PageProps<"/books/[bookId]/notes">) {
  const { bookId } = await params;
  return <BookNoteListPageContainer bookId={bookId} />;
}
