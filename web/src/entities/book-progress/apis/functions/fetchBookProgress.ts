import { getBookProgress } from "@/generated/book-progress/book-progress";
import { ApiError } from "@/shared/apis/customFetch";

import { toBookProgress } from "../mappers/toBookProgress";
import type { BookProgress } from "../../model";

// 単一リソースなので引数は bookId だけ。本が無いときは undefined。
// 進捗の行は本の作成時に api が必ず作るので、本があれば進捗もある。
export async function fetchBookProgress(bookId: string): Promise<BookProgress | undefined> {
  try {
    const response = await getBookProgress(bookId);
    return response.status === 200 ? toBookProgress(response.data) : undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}
