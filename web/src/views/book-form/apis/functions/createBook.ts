"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { toBook } from "@/entities/book/apis/mappers/toBook";
import { createBook as postBook } from "@/generated/books/books";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";
import { routes } from "@/shared/routes/routes";

import { parseBookForm } from "../../lib/parseBookForm";
import type { BookFormState } from "../../model";
import { toBookCreate } from "../mappers/toBookCreate";

// /books/new の Server Action。useActionState から呼ばれるので (state, formData) => state の形。
// 検証に落ちたら通信せずに返し、API に失敗したら message で返す。成功したら詳細へ redirect する。
export async function createBook(state: BookFormState, formData: FormData): Promise<BookFormState> {
  const { values, fieldErrors } = parseBookForm(formData, state.values);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  let createdId: string;
  try {
    const response = await postBook(toBookCreate(values));
    createdId = toBook(response.data).id;
  } catch (error) {
    return {
      values,
      fieldErrors: {},
      message: error instanceof Error ? error.message : "unknown error",
    };
  }

  // 一覧に新しい本を出す。redirect は throw で抜けるので try の外に置く。
  revalidatePath(routes.books());
  revalidatePath(routes.dashboard());
  redirect(routes.bookDetail(createdId));
}
