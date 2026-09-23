import type { BookNoteCreate } from "@/generated/model";

import type { BookNoteFormValues } from "../../model";

// フォームの値 → 作成リクエストの生成型。検証済みの値を渡す前提 (page は数字だけの文字列)。
// bookId はパスに載るので body には入らない。
export function toBookNoteCreate(values: BookNoteFormValues): BookNoteCreate {
  return {
    page: Number(values.page),
    body: values.body,
  };
}
