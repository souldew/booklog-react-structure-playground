import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BookNote as BookNoteResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import type { BookNoteFormState } from "../../model";
import { updateBookNote } from "./updateBookNote";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const editingState: BookNoteFormState = {
  values: { page: "12", body: "DRY 原則" },
  fieldErrors: {},
};

const updated: BookNoteResponse = {
  id: 1,
  book_id: 2,
  page: 14,
  body: "DRY 原則。知識の重複を避ける。",
  created_at: "2026-09-05T03:00:00.000Z",
};

describe("updateBookNote", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
    vi.mocked(redirect).mockClear();
  });

  it("bookId と noteId をパスに載せて PATCH し、詳細と一覧を再検証してメモ一覧へ redirect する", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    await updateBookNote(
      "2",
      "1",
      editingState,
      formDataOf({ page: "14", body: "DRY 原則。知識の重複を避ける。" }),
    );

    expect(requests).toEqual([
      {
        method: "PATCH",
        path: "/books/2/notes/1",
        body: { page: 14, body: "DRY 原則。知識の重複を避ける。" },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/books/2");
    expect(revalidatePath).toHaveBeenCalledWith("/books/2/notes");
    expect(redirect).toHaveBeenCalledWith("/books/2/notes");
  });

  it("検証に落ちたら通信せずに返す", async () => {
    const requests = stubFetch([]);

    const state = await updateBookNote(
      "2",
      "1",
      editingState,
      formDataOf({ page: "14", body: "" }),
    );

    expect(requests).toEqual([]);
    expect(state.fieldErrors.body).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("404 ならメモが無い旨の message で返す", async () => {
    stubFetch([{ status: 404, body: { message: "note not found" } }]);

    const state = await updateBookNote(
      "2",
      "999",
      editingState,
      formDataOf({ page: "1", body: "b" }),
    );

    expect(state.message).toContain("メモが見つかりません");
    expect(redirect).not.toHaveBeenCalled();
  });
});
