import { toBookProgress } from "@/entities/book-progress/apis/mappers/toBookProgress";
import { toBook } from "@/entities/book/apis/mappers/toBook";
import type { BookWithProgress } from "@/generated/model";

import type { ReadingBook } from "../../model";

// 生成型 → 画面の型。本と進捗それぞれの変換は entities の mapper に任せ、ここは組にするだけ。
// progress は生成型の上では optional (include 無しの呼び出しと型を共有している) だが、
// include=progress を付けた呼び出しでは api が必ず返す契約。欠落は契約違反なので黙殺せず投げ、
// ルートの error.tsx に出す (docs/setup.md §21)。
export function toReadingBook(response: BookWithProgress): ReadingBook {
  if (!response.progress) {
    throw new Error(
      `progress がレスポンスに無い (book id: ${response.id})。include=progress を付けた呼び出しでは api が必ず返す契約`,
    );
  }

  return {
    book: toBook(response),
    progress: toBookProgress(response.progress),
  };
}
