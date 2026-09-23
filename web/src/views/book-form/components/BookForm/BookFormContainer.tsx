import { notFound } from "next/navigation";

import { fetchBook } from "@/entities/book/apis/functions/fetchBook";

import { updateBook } from "../../apis/functions/updateBook";
import { toBookFormValues } from "../../lib/toBookFormValues";
import { BookForm } from "./BookForm";

type Props = {
  bookId: string;
};

// 編集画面だけが使う Container。既存の本を取得して初期値にし、bookId を bind した Server Action を渡す。
// 作成画面には対応する Container が無い。取得するものが無いため (docs/screens.md §5)。
export async function BookFormContainer({ bookId }: Props) {
  const book = await fetchBook(bookId);
  if (!book) notFound();

  return (
    <BookForm
      action={updateBook.bind(null, book.id)}
      defaultValues={toBookFormValues(book)}
      statusLocked
      submitLabel="保存する"
    />
  );
}
