import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BookProgress as BookProgressResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import type { BookProgressFormState } from "../../model";
import { updateBookProgress } from "./updateBookProgress";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const state: BookProgressFormState = { values: { currentPage: "120" }, fieldErrors: {} };

const updated: BookProgressResponse = {
  book_id: 2,
  current_page: 200,
  updated_at: "2026-09-23T00:00:00.000Z",
};

describe("updateBookProgress", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("id 無しのパスに PUT し、詳細を再検証して詳細へ redirect する", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    await updateBookProgress("2", 420, state, formDataOf({ currentPage: "200" }));

    expect(requests).toEqual([
      { method: "PUT", path: "/books/2/progress", body: { current_page: 200 } },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/books/2");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(redirect).toHaveBeenCalledWith("/books/2");
  });

  it("bind された totalPages を超えたら通信せずに返す", async () => {
    const requests = stubFetch([]);

    const result = await updateBookProgress("2", 420, state, formDataOf({ currentPage: "500" }));

    expect(requests).toEqual([]);
    expect(result.fieldErrors.currentPage).toBe(
      "現在のページはページ数 (420) 以下で入力してください",
    );
    expect(redirect).not.toHaveBeenCalled();
  });

  it("404 なら本が無い旨の message で返す", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    const result = await updateBookProgress("999", 420, state, formDataOf({ currentPage: "1" }));

    expect(result.message).toContain("本が見つかりません");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
