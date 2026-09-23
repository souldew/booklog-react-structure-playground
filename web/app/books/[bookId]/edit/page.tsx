import { BookEditFormPageContainer } from "@/views/book-form/pages/BookEditFormPageContainer";

// URL パラメータはここで解決して素の値を渡す。
export default async function Page({ params }: PageProps<"/books/[bookId]/edit">) {
  const { bookId } = await params;
  return <BookEditFormPageContainer bookId={bookId} />;
}
