"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateBook as patchBook } from "@/generated/books/books";
import { ApiError } from "@/shared/apis/customFetch";

import { hasFieldErrors, parseBookForm } from "../../lib/parseBookForm";
import type { BookFormState } from "../../model";
import { toBookUpdate } from "../mappers/toBookUpdate";

// /books/[bookId]/edit の Server Action。bookId は Container が bind して渡す。
// status は select が disabled で送られてこないので、toBookUpdate が body から外す (docs/backend.md §1 の論点)。
export async function updateBook(
  bookId: string,
  state: BookFormState,
  formData: FormData,
): Promise<BookFormState> {
  const { values, submittedStatus, fieldErrors } = parseBookForm(formData, state.values);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await patchBook(bookId, toBookUpdate(values, submittedStatus));
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

  // 一覧と詳細の両方に反映する。
  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  redirect(`/books/${bookId}`);
}
