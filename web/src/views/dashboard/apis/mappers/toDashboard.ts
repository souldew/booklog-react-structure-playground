import { toRecentBookNote } from "@/entities/book-note/apis/mappers/toRecentBookNote";
import { toBookReadingStat } from "@/entities/book-reading-stat/apis/mappers/toBookReadingStat";
import type { Dashboard as DashboardResponse } from "@/generated/model";

import type { Dashboard } from "../../model";
import { toReadingBook } from "./toReadingBook";

// 生成型 → ドメイン型。パネルごとの変換は entities と toReadingBook に任せ、ここは画面の形に組み直すだけ。
// API のフィールドが増減したとき、画面が受ける影響はこの 1 ファイルに出る。
export function toDashboard(response: DashboardResponse): Dashboard {
  return {
    readingBooks: response.reading_books.map(toReadingBook),
    recentNotes: response.recent_notes.map(toRecentBookNote),
    monthlyStats: response.monthly_stats.map(toBookReadingStat),
  };
}
