import { describe, expect, it } from "vitest";

import type { Book as BookResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchBooks } from "./fetchBooks";

const responses: BookResponse[] = [
  {
    id: 1,
    title: "リーダブルコード",
    author: "Dustin Boswell",
    status: "reading",
    total_pages: 260,
    created_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: 2,
    title: "達人プログラマー",
    author: "David Thomas",
    status: "on_hold",
    total_pages: 420,
    created_at: "2026-09-02T00:00:00.000Z",
  },
];

describe("fetchBooks", () => {
  it("一覧の各要素を mapper に通す", async () => {
    const requests = stubFetch([{ status: 200, body: responses }]);

    const books = await fetchBooks();

    expect(requests).toEqual([{ method: "GET", path: "/books", body: undefined }]);
    expect(books).toEqual([
      expect.objectContaining({ id: "1", status: "reading" }),
      expect.objectContaining({ id: "2", status: "onHold" }),
    ]);
  });
});
