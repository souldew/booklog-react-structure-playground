import { describe, expect, it } from "vitest";

import type { Dashboard as DashboardResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchDashboard } from "./fetchDashboard";

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

describe("fetchDashboard", () => {
  it("GET /dashboard を 1 回だけ叩き、mapper を通して画面の型で返す", async () => {
    const requests = stubFetch([{ status: 200, body: response }]);

    const dashboard = await fetchDashboard();

    expect(requests).toEqual([{ method: "GET", path: "/dashboard", body: undefined }]);
    expect(dashboard.readingBooks).toHaveLength(1);
    expect(dashboard.readingBooks[0]?.book.id).toBe("1");
    expect(dashboard.recentNotes[0]?.bookTitle).toBe("達人プログラマー");
    expect(dashboard.monthlyStats[0]?.booksAdded).toBe(1);
  });
});
