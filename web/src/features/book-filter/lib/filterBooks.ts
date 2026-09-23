import type { Book } from "@/entities/book/model";

import type { BookFilter } from "../model";

// 一覧の絞り込み。部分一致だけで、全文検索やインデックスは扱わない (docs/overview.md スコープ外)。
export function filterBooks(books: Book[], filter: BookFilter): Book[] {
  const keyword = filter.keyword.trim().toLowerCase();

  return books.filter((book) => {
    if (filter.status !== "all" && book.status !== filter.status) return false;
    if (keyword === "") return true;
    return (
      book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword)
    );
  });
}
