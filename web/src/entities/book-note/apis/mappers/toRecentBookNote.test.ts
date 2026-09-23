import { describe, expect, it } from "vitest";

import type { RecentBookNote as RecentBookNoteResponse } from "@/generated/model";

import { toRecentBookNote } from "./toRecentBookNote";

describe("toRecentBookNote", () => {
  it("メモの項目は toBookNote と同じ変換で、book_title を bookTitle として足す", () => {
    const response: RecentBookNoteResponse = {
      id: 1,
      book_id: 2,
      book_title: "達人プログラマー",
      page: 12,
      body: "DRY 原則",
      created_at: "2026-09-05T03:00:00.000Z",
    };

    expect(toRecentBookNote(response)).toEqual({
      id: "1",
      bookId: "2",
      bookTitle: "達人プログラマー",
      page: 12,
      body: "DRY 原則",
      createdAt: "2026-09-05T03:00:00.000Z",
    });
  });
});
