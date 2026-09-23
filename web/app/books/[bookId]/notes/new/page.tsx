import { BookNoteNewFormPageContainer } from "@/views/book-note-form/pages/BookNoteNewFormPageContainer";

// 親 id を持つ作成。bookId だけ解決して渡す。
export default async function Page({ params }: PageProps<"/books/[bookId]/notes/new">) {
  const { bookId } = await params;
  return <BookNoteNewFormPageContainer bookId={bookId} />;
}
