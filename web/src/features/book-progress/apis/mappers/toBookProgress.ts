import type { BookProgress as BookProgressResponse } from "@/generated/model";

import type { BookProgress } from "../../model";

// 生成型 → ドメイン型。book_id は number なので string にする。
export function toBookProgress(response: BookProgressResponse): BookProgress {
  return {
    bookId: String(response.book_id),
    currentPage: response.current_page,
    updatedAt: response.updated_at,
  };
}
