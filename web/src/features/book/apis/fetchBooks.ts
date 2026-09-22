import { listBooks } from "@/generated/books/books";

import { toBook } from "../lib/toBook";
import type { Book } from "../model";

// 生成クライアントを包んでドメイン型で返す。Container はここだけを呼ぶ。
export async function fetchBooks(): Promise<Book[]> {
  const response = await listBooks();
  return response.data.map(toBook);
}
