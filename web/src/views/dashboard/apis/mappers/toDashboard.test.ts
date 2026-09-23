import { describe, expect, it } from "vitest";

import type { Dashboard as DashboardResponse } from "@/generated/model";

import { toDashboard } from "./toDashboard";

const response: DashboardResponse = {
  reading_books: [
    {
      book: {
        id: 1,
        title: "達人プログラマー",
        author: "David Thomas",
        status: "reading",
        total_pages: 420,
        created_at: "2026-08-01T00:00:00.000Z",
      },
      progress: { book_id: 1, current_page: 120, updated_at: "2026-09-20T09:00:00.000Z" },
    },
  ],
  recent_notes: [
    {
      id: 3,
      book_id: 1,
      book_title: "達人プログラマー",
      page: 12,
      body: "DRY 原則",
      created_at: "2026-09-05T03:00:00.000Z",
    },
  ],
  monthly_stats: [{ month: "2026-09", books_added: 1, pages_added: 600, notes_written: 0 }],
};

describe("toDashboard", () => {
  it("パネルごとの配列を画面のフィールド名に組み直す", () => {
    const dashboard = toDashboard(response);

    expect(dashboard.readingBooks[0]?.book.title).toBe("達人プログラマー");
    expect(dashboard.readingBooks[0]?.progress.currentPage).toBe(120);
    expect(dashboard.recentNotes[0]?.bookTitle).toBe("達人プログラマー");
    expect(dashboard.monthlyStats[0]).toEqual({
      month: "2026-09",
      booksAdded: 1,
      pagesAdded: 600,
      notesWritten: 0,
    });
  });

  it("空の配列はそのまま空で返す", () => {
    expect(toDashboard({ reading_books: [], recent_notes: [], monthly_stats: [] })).toEqual({
      readingBooks: [],
      recentNotes: [],
      monthlyStats: [],
    });
  });
});
