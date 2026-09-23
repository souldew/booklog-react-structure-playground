import type { BookNote } from "@/entities/book-note/model";

import type { BookNoteFormValues } from "../model";

// ドメイン型 → フォームの値。編集画面の初期値に使う。数値は入力欄に載せるので文字列にする。
// id と bookId は URL が持つので、ここでは落とす。
export function toBookNoteFormValues(note: BookNote): BookNoteFormValues {
  return {
    page: String(note.page),
    body: note.body,
  };
}
