import type { Book } from "@/entities/book/model";

import type { BookFormValues } from "../model";

// ドメイン型 → フォームの値。編集画面の初期値に使う。数値は入力欄に載せるので文字列にする。
export function toBookFormValues(book: Book): BookFormValues {
  return {
    title: book.title,
    author: book.author,
    totalPages: String(book.totalPages),
    status: book.status,
  };
}
