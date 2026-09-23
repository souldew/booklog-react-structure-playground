import { toBookStatusResponse } from "@/entities/book/apis/mappers/mapBookStatus";
import type { BookCreate } from "@/generated/model";

import type { BookFormValues } from "../../model";

// フォームの値 → 作成リクエストの生成型。検証済みの値を渡す前提 (totalPages は数字だけの文字列)。
export function toBookCreate(values: BookFormValues): BookCreate {
  return {
    title: values.title,
    author: values.author,
    total_pages: Number(values.totalPages),
    status: toBookStatusResponse(values.status),
  };
}
