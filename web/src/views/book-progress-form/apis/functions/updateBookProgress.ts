"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateBookProgress as putBookProgress } from "@/generated/book-progress/book-progress";
import { ApiError } from "@/shared/apis/customFetch";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";
import { routes } from "@/shared/routes/routes";

import { parseBookProgressForm } from "../../lib/parseBookProgressForm";
import type { BookProgressFormState } from "../../model";
import { toBookProgressUpdate } from "../mappers/toBookProgressUpdate";

// /books/[bookId]/progress の Server Action。bookId と上限の totalPages は Container が bind して渡す。
// 単一リソースなので noteId のような自分の id は無く、メソッドも PATCH ではなく PUT (置き換え)。
// updateBookNote(bookId, noteId, ...) と並べると、引数の差が URL の差 (/notes/[noteId] と /progress) と一致する。
export async function updateBookProgress(
  bookId: string,
  totalPages: number,
  _state: BookProgressFormState,
  formData: FormData,
): Promise<BookProgressFormState> {
  const { values, fieldErrors } = parseBookProgressForm(formData, totalPages);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await putBookProgress(bookId, toBookProgressUpdate(values));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { values, fieldErrors: {}, message: "本が見つかりません。削除された可能性があります" };
    }
    return {
      values,
      fieldErrors: {},
      message: error instanceof Error ? error.message : "unknown error",
    };
  }

  // 進捗は詳細から辿るので詳細へ戻る。redirect は throw で抜けるので try の外に置く。
  revalidatePath(routes.bookDetail(bookId));
  redirect(routes.bookDetail(bookId));
}
