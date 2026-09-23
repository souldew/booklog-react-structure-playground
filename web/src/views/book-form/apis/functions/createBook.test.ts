import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Book as BookResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { EMPTY_BOOK_FORM_VALUES, type BookFormState } from "../../model";
import { createBook } from "./createBook";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// 本物の redirect は throw で抜ける。ここでは呼ばれたことだけ見る。
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const initialState: BookFormState = { values: EMPTY_BOOK_FORM_VALUES, fieldErrors: {} };

const created: BookResponse = {
  id: 42,
  title: "達人プログラマー",
  author: "David Thomas",
  status: "reading",
  total_pages: 420,
  created_at: "2026-09-22T00:00:00.000Z",
};

describe("createBook", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("検証に落ちたら通信せず、項目ごとのエラーと入力値を返す", async () => {
    const requests = stubFetch([]);

    const state = await createBook(
      initialState,
      formDataOf({ title: "", author: "a", totalPages: "x" }),
    );

    expect(requests).toEqual([]);
    expect(state.fieldErrors).toEqual({
      title: "タイトルを入力してください",
      totalPages: "ページ数は 1 以上の整数で入力してください",
    });
    expect(state.values.totalPages).toBe("x");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("POST /books に生成型の body を送り、一覧を再検証して詳細へ redirect する", async () => {
    const requests = stubFetch([{ status: 201, body: created }]);

    await createBook(
      initialState,
      formDataOf({
        title: "達人プログラマー",
        author: "David Thomas",
        totalPages: "420",
        status: "reading",
      }),
    );

    expect(requests).toEqual([
      {
        method: "POST",
        path: "/books",
        body: {
          title: "達人プログラマー",
          author: "David Thomas",
          total_pages: 420,
          status: "reading",
        },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/books");
    expect(redirect).toHaveBeenCalledWith("/books/42");
  });

  it("API に失敗したら message で返し、再検証も redirect もしない", async () => {
    stubFetch([{ status: 500, body: { message: "failed on purpose" } }]);

    const state = await createBook(
      initialState,
      formDataOf({ title: "t", author: "a", totalPages: "10", status: "unread" }),
    );

    expect(state.message).toBe("api responded with 500");
    expect(state.values.title).toBe("t");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
