import type { Book as BookResponse } from "@/generated/model";

import type { Book } from "../../model";
import { toBookStatus } from "./mapBookStatus";

// 生成型 → ドメイン型。API スキーマの変更はこの関数で止める。
export function toBook(response: BookResponse): Book {
  return {
    id: String(response.id),
    title: response.title,
    author: response.author,
    status: toBookStatus(response.status),
    totalPages: response.total_pages,
    createdAt: response.created_at,
  };
}
