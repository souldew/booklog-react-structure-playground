import { getBook } from "@/generated/books/books";
import { ApiError } from "@/shared/apis/customFetch";

import { toBook } from "../lib/toBook";
import type { Book } from "../model";

// 404 は undefined で返す。notFound() を呼ぶかどうかは Container が決める。
// mutator が 4xx を throw するので catch で受けるが、生成型の union は status で絞る必要がある。
export async function fetchBook(bookId: string): Promise<Book | undefined> {
  try {
    const response = await getBook(bookId);
    return response.status === 200 ? toBook(response.data) : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}
