import type { RecentBookNote as RecentBookNoteResponse } from "@/generated/model";

import type { RecentBookNote } from "../../model";
import { toBookNote } from "./toBookNote";

// 生成型 → ドメイン型。メモの部分は toBookNote に任せ、本のタイトルだけ足す。
export function toRecentBookNote(response: RecentBookNoteResponse): RecentBookNote {
  return {
    ...toBookNote(response),
    bookTitle: response.book_title,
  };
}
