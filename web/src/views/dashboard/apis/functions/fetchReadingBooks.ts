import { listBooks } from "@/generated/books/books";

import { toReadingBook } from "../mappers/toReadingBook";
import type { ReadingBook } from "../../model";

// 読書中の本と進捗の組を 1 回で取る。本ごとに /books/:bookId/progress を叩くと N+1 になるので、
// include=progress で api が同梱して返す (docs/backend.md §4)。
export async function fetchReadingBooks(): Promise<ReadingBook[]> {
  const response = await listBooks({ status: "reading", include: "progress" });
  return response.data.map(toReadingBook);
}
