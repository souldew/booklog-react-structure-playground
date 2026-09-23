import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BookNote as BookNoteResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { EMPTY_BOOK_NOTE_FORM_VALUES, type BookNoteFormState } from "../../model";
import { createBookNote } from "./createBookNote";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
// 本物の redirect は throw で抜ける。ここでは呼ばれたことだけ見る。
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const initialState: BookNoteFormState = { values: EMPTY_BOOK_NOTE_FORM_VALUES, fieldErrors: {} };

const created: BookNoteResponse = {
  id: 10,
  book_id: 2,
  page: 48,
  body: "曳光弾",
  created_at: "2026-09-23T00:00:00.000Z",
};

describe("createBookNote", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("検証に落ちたら通信せず、項目ごとのエラーと入力値を返す", async () => {
    const requests = stubFetch([]);

    const state = await createBookNote("2", initialState, formDataOf({ page: "x", body: "" }));

    expect(requests).toEqual([]);
    expect(state.fieldErrors).toEqual({
      page: "ページは 0 以上の整数で入力してください",
      body: "本文を入力してください",
    });
    expect(state.values.page).toBe("x");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("親の bookId をパスに載せて POST し、詳細と一覧を再検証してメモ一覧へ redirect する", async () => {
    const requests = stubFetch([{ status: 201, body: created }]);

    await createBookNote("2", initialState, formDataOf({ page: "48", body: "曳光弾" }));

    expect(requests).toEqual([
      { method: "POST", path: "/books/2/notes", body: { page: 48, body: "曳光弾" } },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/books/2");
    expect(revalidatePath).toHaveBeenCalledWith("/books/2/notes");
    expect(redirect).toHaveBeenCalledWith("/books/2/notes");
  });

  it("本が無い (404) なら本が無い旨の message で返す", async () => {
    stubFetch([{ status: 404, body: { message: "book not found" } }]);

    const state = await createBookNote("999", initialState, formDataOf({ page: "1", body: "b" }));

    expect(state.message).toContain("本が見つかりません");
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("API に失敗したら message で返し、再検証も redirect もしない", async () => {
    stubFetch([{ status: 500, body: { message: "failed on purpose" } }]);

    const state = await createBookNote("2", initialState, formDataOf({ page: "1", body: "b" }));

    expect(state.message).toBe("api responded with 500");
    expect(state.values.body).toBe("b");
    expect(redirect).not.toHaveBeenCalled();
  });
});
