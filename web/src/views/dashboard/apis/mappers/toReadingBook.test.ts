import { describe, expect, it } from "vitest";

import type { ReadingBook as ReadingBookResponse } from "@/generated/model";

import { toReadingBook } from "./toReadingBook";

describe("toReadingBook", () => {
  it("本と進捗をそれぞれ entities の mapper に通して組にする", () => {
    const response: ReadingBookResponse = {
      book: {
        id: 1,
        title: "達人プログラマー",
        author: "David Thomas",
        status: "reading",
        total_pages: 420,
        created_at: "2026-08-01T00:00:00.000Z",
      },
      progress: {
        book_id: 1,
        current_page: 120,
        updated_at: "2026-09-20T09:00:00.000Z",
      },
    };

    expect(toReadingBook(response)).toEqual({
      book: {
        id: "1",
        title: "達人プログラマー",
        author: "David Thomas",
        status: "reading",
        totalPages: 420,
        createdAt: "2026-08-01T00:00:00.000Z",
      },
      progress: {
        bookId: "1",
        currentPage: 120,
        updatedAt: "2026-09-20T09:00:00.000Z",
      },
    });
  });
});
