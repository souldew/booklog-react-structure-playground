import { describe, expect, it } from "vitest";

import type { BookWithProgress } from "@/generated/model";

import { toReadingBook } from "./toReadingBook";

const response: BookWithProgress = {
  id: 1,
  title: "達人プログラマー",
  author: "David Thomas",
  status: "reading",
  total_pages: 420,
  created_at: "2026-08-01T00:00:00.000Z",
  progress: {
    book_id: 1,
    current_page: 120,
    updated_at: "2026-09-20T09:00:00.000Z",
  },
};

describe("toReadingBook", () => {
  it("本と進捗をそれぞれ entities の mapper に通して組にする", () => {
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

  it("progress が無い要素は契約違反なので投げる", () => {
    const { progress: _progress, ...withoutProgress } = response;

    expect(() => toReadingBook(withoutProgress)).toThrowError(/progress がレスポンスに無い/);
  });
});
