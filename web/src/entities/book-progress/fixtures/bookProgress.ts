import type { BookProgress } from "../model";

// story とテストで使う BookProgress。bookId は entities/book/fixtures の reading (id: "2"、420 ページ) に合わせる。
export const BOOK_PROGRESS_FIXTURE: BookProgress = {
  bookId: "2",
  currentPage: 120,
  updatedAt: "2026-09-12T09:00:00.000Z",
};
