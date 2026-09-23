import type { MonthlyStat as MonthlyStatResponse } from "@/generated/model";

import type { MonthlyStat } from "../../model";

// 生成型 → ドメイン型。snake_case を camelCase にするだけだが、境界はここに置く。
export function toMonthlyStat(response: MonthlyStatResponse): MonthlyStat {
  return {
    month: response.month,
    booksAdded: response.books_added,
    pagesAdded: response.pages_added,
    notesWritten: response.notes_written,
  };
}
