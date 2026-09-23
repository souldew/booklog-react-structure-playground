import { fetchBookProgress } from "@/entities/book-progress/apis/functions/fetchBookProgress";
import { fetchBooks } from "@/entities/book/apis/functions/fetchBooks";

import type { ReadingBook } from "../../model";
import { ReadingBookList } from "./ReadingBookList";

// 読書中の本を取り、その本の数だけ進捗を取って組にする。合成はここで行う (fetch は 1 エンドポイントずつ)。
// 進捗のパスは本の id が決まらないと組めないので 2 段階になる。進捗どうしは Promise.all で並列に取る。
export async function ReadingBookListContainer() {
  const books = await fetchBooks({ status: "reading" });
  const progresses = await Promise.all(books.map((book) => fetchBookProgress(book.id)));

  const items = books.flatMap((book, index): ReadingBook[] => {
    const progress = progresses[index];
    return progress ? [{ book, progress }] : [];
  });

  return <ReadingBookList items={items} />;
}
