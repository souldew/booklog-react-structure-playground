import { describe, expect, it } from "vitest";

import type { BookProgress as BookProgressResponse } from "@/generated/model";
import { ApiError } from "@/shared/apis/customFetch";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchBookProgress } from "./fetchBookProgress";

const response: BookProgressResponse = {
  book_id: 2,
  current_page: 120,
  updated_at: "2026-09-12T09:00:00.000Z",
};

describe("fetchBookProgress", () => {
  it("本の id をパスに載せ (noteId のような自分の id は無い)、mapper を通してドメイン型で返す", async () => {
    const requests = stubFetch([{ status: 200, body: response }]);

    const progress = await fetchBookProgress("2");

    expect(requests).toEqual([{ method: "GET", path: "/books/2/progress", body: undefined }]);
    expect(progress).toEqual({ bookId: "2", currentPage: 120, updatedAt: response.updated_at });
  });

  it("本が無い (404) なら undefined", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    await expect(fetchBookProgress("999")).resolves.toBeUndefined();
  });

  it("404 以外の失敗は ApiError のまま投げる", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    await expect(fetchBookProgress("2")).rejects.toBeInstanceOf(ApiError);
  });
});
