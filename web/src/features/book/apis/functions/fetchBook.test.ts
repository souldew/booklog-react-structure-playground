import { describe, expect, it } from "vitest";

import type { Book as BookResponse } from "@/generated/model";
import { ApiError } from "@/shared/apis/customFetch";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchBook } from "./fetchBook";

const response: BookResponse = {
  id: 7,
  title: "Clean Architecture",
  author: "Robert C. Martin",
  status: "on_hold",
  total_pages: 432,
  created_at: "2026-09-03T00:00:00.000Z",
};

describe("fetchBook", () => {
  it("生成クライアント → mutator → mapper を通り、ドメイン型で返す", async () => {
    const requests = stubFetch([{ status: 200, body: response }]);

    const book = await fetchBook("7");

    expect(requests).toEqual([{ method: "GET", path: "/books/7", body: undefined }]);
    expect(book).toMatchObject({ id: "7", status: "onHold" });
  });

  it("404 は undefined にする。notFound() を呼ぶかは Container が決める", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    await expect(fetchBook("999")).resolves.toBeUndefined();
  });

  it("404 以外の失敗は ApiError のまま投げる", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    await expect(fetchBook("1")).rejects.toBeInstanceOf(ApiError);
  });
});
