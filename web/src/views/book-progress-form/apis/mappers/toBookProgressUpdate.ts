import type { BookProgressUpdate } from "@/generated/model";

import type { BookProgressFormValues } from "../../model";

// フォームの値 → 更新リクエストの生成型。単一リソースの PUT なので全項目を送る。
export function toBookProgressUpdate(values: BookProgressFormValues): BookProgressUpdate {
  return { current_page: Number(values.currentPage) };
}
