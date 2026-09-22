import type { BookStatus } from "./model";

// 画面の都合の値のうち、複数箇所 (BookStatusBadge と BookFilterField) で使うもの。
// 1 箇所でしか使わない文言はコンポーネントにベタ書きし、ここには置かない。業務の値は model に置く。
// 型だけ model から借りて、satisfies で状態が増えたときの抜けを検査する。
export const BOOK_STATUS_LABELS = {
  unread: "未読",
  reading: "読書中",
  onHold: "中断中",
  finished: "読了",
} as const satisfies Record<BookStatus, string>;
