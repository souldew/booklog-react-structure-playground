import { listRecentNotes } from "@/generated/notes/notes";

import { toRecentBookNote } from "../mappers/toRecentBookNote";
import type { RecentBookNote } from "../../model";

// 本を横断した最近のメモ。/books/:bookId/notes (1 冊のメモ) とはエンドポイントが別で、親が /notes になる。
// 件数を省くと api の既定 (5 件) になる。
export async function fetchRecentBookNotes(limit?: number): Promise<RecentBookNote[]> {
  const response = await listRecentNotes(limit === undefined ? undefined : { limit });
  return response.data.map(toRecentBookNote);
}
