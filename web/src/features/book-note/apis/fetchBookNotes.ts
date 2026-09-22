import { listBookNotes } from "@/generated/book-notes/book-notes";
import { ApiError } from "@/shared/apis/customFetch";

import { toBookNote } from "../lib/toBookNote";
import type { BookNote } from "../model";

// 本が無いときは undefined。メモが 0 件なら空配列。
export async function fetchBookNotes(bookId: string): Promise<BookNote[] | undefined> {
  try {
    const response = await listBookNotes(bookId);
    return response.status === 200 ? response.data.map(toBookNote) : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}
