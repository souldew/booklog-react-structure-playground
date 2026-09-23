"use server";

import { revalidatePath } from "next/cache";

import { toBookStatusResponse } from "@/entities/book/apis/mappers/mapBookStatus";
import type { BookStatus } from "@/entities/book/model";
import { updateBook } from "@/generated/books/books";
import type { ActionResult } from "@/shared/apis/actionResult";
import { routes } from "@/shared/routes/routes";

// 一覧の行から呼ぶ Server Action。更新は form 画面 (edit) からだけ起きるものではなく、
// 一覧のトグルのようにその場で完結する更新もある (docs/overview.md)。
// 失敗は throw せず値で返し、行単位で表示する。
export async function updateBookStatus(bookId: string, status: BookStatus): Promise<ActionResult> {
  try {
    await updateBook(bookId, { status: toBookStatusResponse(status) });
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "unknown error" };
  }

  // これを呼び忘れると一覧が古いまま残る (docs/backend.md §7)。
  revalidatePath(routes.books());
  return { ok: true };
}
