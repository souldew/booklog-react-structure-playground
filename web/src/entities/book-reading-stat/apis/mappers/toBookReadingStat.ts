import type { BookReadingStat as BookReadingStatResponse } from "@/generated/model";

import type { BookReadingStat } from "../../model";

// 生成型 → ドメイン型。snake_case を camelCase にするだけだが、境界はここに置く。
export function toBookReadingStat(response: BookReadingStatResponse): BookReadingStat {
  return {
    month: response.month,
    booksAdded: response.books_added,
    pagesAdded: response.pages_added,
    notesWritten: response.notes_written,
  };
}
