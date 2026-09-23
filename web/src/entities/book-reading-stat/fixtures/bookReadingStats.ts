import type { BookReadingStat } from "../model";

// story とテストで使う月別統計。api と同じく新しい月が先で、データの無い月 (0) を含む。
export const BOOK_READING_STAT_FIXTURES: BookReadingStat[] = [
  { month: "2026-09", booksAdded: 1, pagesAdded: 600, notesWritten: 0 },
  { month: "2026-08", booksAdded: 1, pagesAdded: 312, notesWritten: 1 },
  { month: "2026-07", booksAdded: 1, pagesAdded: 340, notesWritten: 1 },
  { month: "2026-06", booksAdded: 1, pagesAdded: 456, notesWritten: 1 },
  { month: "2026-05", booksAdded: 0, pagesAdded: 0, notesWritten: 1 },
  { month: "2026-04", booksAdded: 1, pagesAdded: 352, notesWritten: 0 },
];
