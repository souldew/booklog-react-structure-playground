import { describe, expect, it } from "vitest";

import type { RecentBookNote as RecentBookNoteResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchRecentBookNotes } from "./fetchRecentBookNotes";

const response: RecentBookNoteResponse = {
  id: 10,
  book_id: 2,
  book_title: "達人プログラマー",
  page: 12,
  body: "DRY 原則",
  created_at: "2026-09-05T03:00:00.000Z",
};

describe("fetchRecentBookNotes", () => {
  it("件数を省くとクエリ無しで GET /notes/recent を叩き、mapper に通す", async () => {
    const requests = stubFetch([{ status: 200, body: [response] }]);

    const notes = await fetchRecentBookNotes();

    expect(requests).toEqual([{ method: "GET", path: "/notes/recent", body: undefined }]);
    expect(notes).toEqual([expect.objectContaining({ id: "10", bookTitle: "達人プログラマー" })]);
  });

  it("件数を渡すと limit クエリに載る", async () => {
    const requests = stubFetch([{ status: 200, body: [] }]);

    await fetchRecentBookNotes(3);

    expect(requests[0]?.path).toBe("/notes/recent?limit=3");
  });
});
