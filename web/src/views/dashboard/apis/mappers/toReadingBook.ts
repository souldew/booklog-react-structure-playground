import { toBookProgress } from "@/entities/book-progress/apis/mappers/toBookProgress";
import { toBook } from "@/entities/book/apis/mappers/toBook";
import type { ReadingBook as ReadingBookResponse } from "@/generated/model";

import type { ReadingBook } from "../../model";

// 生成型 → ドメイン型。本と進捗それぞれの変換は entities の mapper に任せ、ここは組にするだけ。
export function toReadingBook(response: ReadingBookResponse): ReadingBook {
  return {
    book: toBook(response.book),
    progress: toBookProgress(response.progress),
  };
}
