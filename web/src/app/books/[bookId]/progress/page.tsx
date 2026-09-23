import { BookProgressFormPageContainer } from "@/views/book-progress-form/pages/BookProgressFormPageContainer";

// 単数形 → 単一リソース → 1 件の編集。notes/ と違い、この下に動的セグメントは無い (docs/screens.md §2)。
export default async function Page({ params }: PageProps<"/books/[bookId]/progress">) {
  const { bookId } = await params;
  return <BookProgressFormPageContainer bookId={bookId} />;
}
