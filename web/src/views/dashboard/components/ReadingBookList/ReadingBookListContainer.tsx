import { fetchReadingBooks } from "../../apis/functions/fetchReadingBooks";
import { ReadingBookList } from "./ReadingBookList";

// 読書中の本と進捗の組を 1 回で取る。組にするのは fetchReadingBooks (この view の apis) で、ここは渡すだけ。
export async function ReadingBookListContainer() {
  const items = await fetchReadingBooks();

  return <ReadingBookList items={items} />;
}
