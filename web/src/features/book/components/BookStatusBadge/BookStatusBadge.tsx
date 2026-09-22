import { Badge } from "@/components/ui/badge";

import { BOOK_STATUS_LABELS } from "../../constants";
import type { BookStatus } from "../../model";

// 状態 → Badge の見た目の対応表。使うのはこのコンポーネントだけなので constants に出さず、ここに置く。
// ラベル (BOOK_STATUS_LABELS) と違い、Badge の variant 名という UI 部品の都合なので features の外へは出ない。
// satisfies を付けて、状態が増えたときに見た目の指定漏れをコンパイルエラーにする。
const VARIANTS = {
  unread: "outline",
  reading: "default",
  onHold: "secondary",
  finished: "secondary",
} as const satisfies Record<BookStatus, "default" | "secondary" | "outline">;

// 一覧と詳細の両方で使うので features に置く。
export function BookStatusBadge({ status }: { status: BookStatus }) {
  return <Badge variant={VARIANTS[status]}>{BOOK_STATUS_LABELS[status]}</Badge>;
}
