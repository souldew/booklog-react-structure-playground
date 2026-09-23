"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createBookNote as postBookNote } from "@/generated/book-notes/book-notes";
import { ApiError } from "@/shared/apis/customFetch";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";
import { routes } from "@/shared/routes/routes";

import { parseBookNoteForm } from "../../lib/parseBookNoteForm";
import type { BookNoteFormState } from "../../model";
import { toBookNoteCreate } from "../mappers/toBookNoteCreate";

// /books/[bookId]/notes/new の Server Action。親の bookId は Container が bind して渡す (親 id を持つ作成)。
// 検証に落ちたら通信せずに返し、API に失敗したら message で返す。成功したらメモ一覧へ redirect する。
export async function createBookNote(
  bookId: string,
  _state: BookNoteFormState,
  formData: FormData,
): Promise<BookNoteFormState> {
  const { values, fieldErrors } = parseBookNoteForm(formData);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  try {
    await postBookNote(bookId, toBookNoteCreate(values));
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

  // メモは詳細画面にも出るので、一覧と詳細の両方を再検証する。redirect は throw で抜けるので try の外に置く。
  revalidatePath(routes.bookDetail(bookId));
  revalidatePath(routes.bookNotes(bookId));
  redirect(routes.bookNotes(bookId));
}
