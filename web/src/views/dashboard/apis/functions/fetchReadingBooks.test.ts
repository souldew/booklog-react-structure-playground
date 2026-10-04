import { describe, expect, it } from "vitest";

import type { BookWithProgress } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchReadingBooks } from "./fetchReadingBooks";

const responses: BookWithProgress[] = [
  {
    id: 1,
    title: "リーダブルコード",
    author: "Dustin Boswell",
    status: "reading",
    total_pages: 260,
    created_at: "2026-09-01T00:00:00.000Z",
    progress: {
      book_id: 1,
      current_page: 120,
      updated_at: "2026-09-10T00:00:00.000Z",
    },
  },
];

describe("fetchReadingBooks", () => {
  it("status=reading と include=progress をクエリに載せ、各要素を mapper に通す", async () => {
    const requests = stubFetch([{ status: 200, body: responses }]);

    const items = await fetchReadingBooks();

    expect(requests).toEqual([
      { method: "GET", path: "/books?status=reading&include=progress", body: undefined },
    ]);
    expect(items).toEqual([
      {
        book: expect.objectContaining({ id: "1", status: "reading", totalPages: 260 }),
        progress: expect.objectContaining({ bookId: "1", currentPage: 120 }),
      },
    ]);
  });
});
