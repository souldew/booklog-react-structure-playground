import type { BookStatus as BookStatusResponse } from "@/generated/model";

import type { BookStatus } from "../model";

// 生成型 ⇄ ドメイン型の対応表。
// satisfies を付けておくと、API 側に値が増えたときに抜けがコンパイルエラーになる。
const toDomain = {
  unread: "unread",
  reading: "reading",
  on_hold: "onHold",
  finished: "finished",
} as const satisfies Record<BookStatusResponse, BookStatus>;

const toResponse = {
  unread: "unread",
  reading: "reading",
  onHold: "on_hold",
  finished: "finished",
} as const satisfies Record<BookStatus, BookStatusResponse>;

export function toBookStatus(response: BookStatusResponse): BookStatus {
  return toDomain[response];
}

export function toBookStatusResponse(status: BookStatus): BookStatusResponse {
  return toResponse[status];
}
