import { describe, expect, it } from "vitest";

import type { BookNote as BookNoteResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchBookNotes } from "./fetchBookNotes";

const response: BookNoteResponse = {
  id: 10,
  book_id: 2,
  page: 12,
  body: "DRY 原則",
  created_at: "2026-09-05T03:00:00.000Z",
};

describe("fetchBookNotes", () => {
  it("本の id をパスに載せ、メモを mapper に通す", async () => {
    const requests = stubFetch([{ status: 200, body: [response] }]);

    const notes = await fetchBookNotes("2");

    expect(requests).toEqual([{ method: "GET", path: "/books/2/notes", body: undefined }]);
    expect(notes).toEqual([expect.objectContaining({ id: "10", bookId: "2" })]);
  });

  it("メモが 0 件なら空配列", async () => {
    stubFetch([{ status: 200, body: [] }]);

    await expect(fetchBookNotes("2")).resolves.toEqual([]);
  });

  it("本が無い (404) なら undefined", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    await expect(fetchBookNotes("999")).resolves.toBeUndefined();
  });
});
