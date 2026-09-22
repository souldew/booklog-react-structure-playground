import { toBookStatusResponse } from "@/features/book/apis/mappers/mapBookStatus";
import type { BookStatus } from "@/features/book/model";
import type { BookUpdate } from "@/generated/model";

import type { BookFormValues } from "../../model";

// フォームの値 → 更新リクエストの生成型。
// status は送信されたときだけ含める。編集画面では select が disabled で送られてこないので、
// values.status (再表示用に引き継いだ値) を使ってしまうと「変えていないのに送る」ことになる。
// 含めなければ API 側は既存の値を保つ (PATCH の部分更新)。
export function toBookUpdate(
  values: BookFormValues,
  submittedStatus: BookStatus | undefined,
): BookUpdate {
  return {
    title: values.title,
    author: values.author,
    total_pages: Number(values.totalPages),
    ...(submittedStatus === undefined ? {} : { status: toBookStatusResponse(submittedStatus) }),
  };
}
