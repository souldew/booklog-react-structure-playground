import { describe, expect, it } from "vitest";

import type { Book as BookResponse } from "@/generated/model";

import { toBook } from "./toBook";

describe("toBook", () => {
  it("snake_case の生成型を camelCase のドメイン型にし、id を string にする", () => {
    const response: BookResponse = {
      id: 7,
      title: "リーダブルコード",
      author: "Dustin Boswell",
      status: "on_hold",
      total_pages: 260,
      created_at: "2026-09-01T00:00:00.000Z",
    };

    expect(toBook(response)).toEqual({
      id: "7",
      title: "リーダブルコード",
      author: "Dustin Boswell",
      status: "onHold",
      totalPages: 260,
      createdAt: "2026-09-01T00:00:00.000Z",
    });
  });
});
