import type { BookNoteUpdate } from "@/generated/model";

import type { BookNoteFormValues } from "../../model";

// フォームの値 → 更新リクエストの生成型。
// API の PATCH は部分更新で全項目 optional だが、このフォームは全項目を編集できるので全部送る。
// BookForm の toBookUpdate のように「送られなかった項目を外す」判断は要らない。disabled な項目が無いため。
// toBookNoteCreate と中身は同じだが、生成型が別なので関数も分ける (docs/directory-conventions.md「apis の内側」)。
export function toBookNoteUpdate(values: BookNoteFormValues): BookNoteUpdate {
  return {
    page: Number(values.page),
    body: values.body,
  };
}
