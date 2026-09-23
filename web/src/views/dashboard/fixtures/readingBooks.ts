import { BOOK_PROGRESS_FIXTURE } from "@/entities/book-progress/fixtures/bookProgress";
import { BOOK_FIXTURES } from "@/entities/book/fixtures/books";

import type { ReadingBook } from "../model";

// story で使う「読書中の本と進捗」。1 冊目は entities の fixtures の組み合わせ、2 冊目は読み始めたばかり。
export const READING_BOOK_FIXTURES: ReadingBook[] = [
  { book: BOOK_FIXTURES.reading, progress: BOOK_PROGRESS_FIXTURE },
  {
    book: {
      id: "5",
      title: "Learning Domain-Driven Design",
      author: "Vlad Khononov",
      status: "reading",
      totalPages: 340,
      createdAt: "2026-07-28T09:00:00.000Z",
    },
    progress: { bookId: "5", currentPage: 12, updatedAt: "2026-09-20T09:00:00.000Z" },
  },
];
