import { fetchBooks } from "@/features/book/apis/functions/fetchBooks";

import { updateBookStatus } from "../../apis/functions/updateBookStatus";
import { BookRows } from "./BookRows";

// サーバーで取得して Presentational に渡す。Server Action もここから props で渡す。
export async function BookRowsContainer() {
  const books = await fetchBooks();
  return <BookRows books={books} onChangeStatus={updateBookStatus} />;
}
