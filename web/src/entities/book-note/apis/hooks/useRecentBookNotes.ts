import { useListRecentNotesSuspense } from "@/generated/notes/notes";

import { toRecentBookNote } from "../mappers/toRecentBookNote";
import type { RecentBookNote } from "../../model";

// 本を横断した最近のメモ。fetchRecentBookNotes のクライアント版。件数を省くと api の既定 (5 件)。
export function useRecentBookNotes(limit?: number): RecentBookNote[] {
  const { data } = useListRecentNotesSuspense(limit === undefined ? undefined : { limit }, {
    query: { select: (response) => response.data.map(toRecentBookNote) },
  });
  return data;
}
