import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Book as BookResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import type { BookFormState } from "../../model";
import { updateBook } from "./updateBook";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

// 編集画面の初期状態。status は onHold で、select は disabled なので送信されない。
const editingState: BookFormState = {
  values: {
    title: "Clean Architecture",
    author: "Robert C. Martin",
    totalPages: "432",
    status: "onHold",
  },
  fieldErrors: {},
};

const updated: BookResponse = {
  id: 3,
  title: "Clean Architecture 2版",
  author: "Robert C. Martin",
  status: "on_hold",
  total_pages: 450,
  created_at: "2026-09-03T00:00:00.000Z",
};

describe("updateBook", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(redirect).mockClear();
  });

  // docs/backend.md §1 の論点。disabled な input は送信されないので、status を body に含めてはいけない。
  it("status が送られてこなければ body から外して PATCH し、一覧と詳細を再検証して詳細へ redirect する", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    await updateBook(
      "3",
      editingState,
      formDataOf({
        title: "Clean Architecture 2版",
        author: "Robert C. Martin",
        totalPages: "450",
      }),
    );

    expect(requests).toEqual([
      {
        method: "PATCH",
        path: "/books/3",
        body: { title: "Clean Architecture 2版", author: "Robert C. Martin", total_pages: 450 },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/books");
    expect(revalidatePath).toHaveBeenCalledWith("/books/3");
    expect(redirect).toHaveBeenCalledWith("/books/3");
  });

  it("検証に落ちたら通信せず、status は previous のものを引き継いで返す", async () => {
    const requests = stubFetch([]);

    const state = await updateBook(
      "3",
      editingState,
      formDataOf({ title: "", author: "a", totalPages: "1" }),
    );

    expect(requests).toEqual([]);
    expect(state.fieldErrors.title).toBeDefined();
    expect(state.values.status).toBe("onHold");
  });

  it("404 なら本が無い旨の message で返す", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    const state = await updateBook(
      "999",
      editingState,
      formDataOf({ title: "t", author: "a", totalPages: "1" }),
    );

    expect(state.message).toContain("本が見つかりません");
    expect(redirect).not.toHaveBeenCalled();
  });
});
