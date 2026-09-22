import { fetchBooks } from "@/features/book/apis/fetchBooks";

import { updateBookStatus } from "../../apis/updateBookStatus";
import { BookRows } from "./BookRows";

// サーバーで取得して Presentational に渡す。Server Action もここから props で渡す。
export async function BookRowsContainer() {
  const books = await fetchBooks();
  return <BookRows books={books} onChangeStatus={updateBookStatus} />;
}
