import { notFound } from "next/navigation";

import { fetchBookProgress } from "@/entities/book-progress/apis/functions/fetchBookProgress";
import { fetchBook } from "@/entities/book/apis/functions/fetchBook";

import { updateBookProgress } from "../../apis/functions/updateBookProgress";
import { toBookProgressFormValues } from "../../lib/toBookProgressFormValues";
import { BookProgressForm } from "./BookProgressForm";

type Props = {
  bookId: string;
};

// 上限 (本のページ数) と現在値 (進捗) は別のエンドポイントにある。1 関数の通信は 1 回なので、合成はここで行う
// (docs/directory-conventions.md「apis の内側」)。2 つは独立なので並列に取る。
// 進捗の行は本の作成時に api が必ず作るので、本があれば進捗もある。どちらかが無ければ本が無い。
export async function BookProgressFormContainer({ bookId }: Props) {
  const [book, progress] = await Promise.all([fetchBook(bookId), fetchBookProgress(bookId)]);
  if (!book || !progress) notFound();

  return (
    <BookProgressForm
      action={updateBookProgress.bind(null, book.id, book.totalPages)}
      defaultValues={toBookProgressFormValues(progress)}
      totalPages={book.totalPages}
      updatedAt={progress.updatedAt}
    />
  );
}
