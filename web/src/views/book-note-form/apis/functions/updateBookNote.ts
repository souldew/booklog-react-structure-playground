"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { updateBookNote as patchBookNote } from "@/generated/book-notes/book-notes";
import { ApiError } from "@/shared/apis/customFetch";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";
import { routes } from "@/shared/routes/routes";

import { parseBookNoteForm } from "../../lib/parseBookNoteForm";
import type { BookNoteFormState } from "../../model";
import { toBookNoteUpdate } from "../mappers/toBookNoteUpdate";

// /books/[bookId]/notes/[noteId]/edit の Server Action。bookId と noteId は Container が bind して渡す (ネストした編集)。
// コレクションのメンバーなので noteId が要る。単一リソースの updateBookProgress と並べると、引数の差がそのまま URL の差。
export async function updateBookNote(
  bookId: string,
  noteId: string,
  _state: BookNoteFormState,
  formData: FormData,
): Promise<BookNoteFormState> {
  const { values, fieldErrors } = parseBookNoteForm(formData);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await patchBookNote(bookId, noteId, toBookNoteUpdate(values));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        values,
        fieldErrors: {},
        message: "メモが見つかりません。削除された可能性があります",
      };
    }
    return {
      values,
      fieldErrors: {},
      message: error instanceof Error ? error.message : "unknown error",
    };
  }

  revalidatePath(routes.bookDetail(bookId));
  revalidatePath(routes.bookNotes(bookId));
  redirect(routes.bookNotes(bookId));
}
