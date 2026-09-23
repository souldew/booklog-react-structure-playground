import { describe, expect, it } from "vitest";

import type { BookNote as BookNoteResponse } from "@/generated/model";

import { toBookNote } from "./toBookNote";

describe("toBookNote", () => {
  it("snake_case の生成型を camelCase のドメイン型にし、id と book_id を string にする", () => {
    const response: BookNoteResponse = {
      id: 1,
      book_id: 2,
      page: 12,
      body: "DRY 原則",
      created_at: "2026-09-05T03:00:00.000Z",
    };

    expect(toBookNote(response)).toEqual({
      id: "1",
      bookId: "2",
      page: 12,
      body: "DRY 原則",
      createdAt: "2026-09-05T03:00:00.000Z",
    });
  });
});
