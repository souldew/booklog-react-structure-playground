import { notFound } from "next/navigation";

import { fetchBook } from "@/features/book/apis/functions/fetchBook";

import { BookInfo } from "./BookInfo";

type Props = {
  bookId: string;
};

export async function BookInfoContainer({ bookId }: Props) {
  const book = await fetchBook(bookId);
  if (!book) notFound();
  return <BookInfo book={book} />;
}
