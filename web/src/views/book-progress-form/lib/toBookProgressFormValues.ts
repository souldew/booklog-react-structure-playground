import type { BookProgress } from "@/features/book-progress/model";

import type { BookProgressFormValues } from "../model";

// ドメイン型 → フォームの値。数値は入力欄に載せるので文字列にする。
export function toBookProgressFormValues(progress: BookProgress): BookProgressFormValues {
  return { currentPage: String(progress.currentPage) };
}
