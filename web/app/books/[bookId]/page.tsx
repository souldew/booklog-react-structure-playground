import { BookDetailPageContainer } from "@/views/book-detail/pages/BookDetailPageContainer";

// URL パラメータはここで解決して素の値を渡す。
export default async function Page({ params }: PageProps<"/books/[bookId]">) {
  const { bookId } = await params;
  return <BookDetailPageContainer bookId={bookId} />;
}
