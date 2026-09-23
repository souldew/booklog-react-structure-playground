import { describe, expect, it } from "vitest";

import type { BookProgress as BookProgressResponse } from "@/generated/model";

import { toBookProgress } from "./toBookProgress";

describe("toBookProgress", () => {
  it("snake_case の生成型を camelCase のドメイン型にし、book_id を string にする", () => {
    const response: BookProgressResponse = {
      book_id: 2,
      current_page: 120,
      updated_at: "2026-09-12T09:00:00.000Z",
    };

    expect(toBookProgress(response)).toEqual({
      bookId: "2",
      currentPage: 120,
      updatedAt: "2026-09-12T09:00:00.000Z",
    });
  });
});
