import { createRoute } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { DashboardSchema } from "../schemas.ts";

const tags = ["dashboard"];
const MONTH_COUNT = 6;
const RECENT_NOTE_LIMIT = 5;

const getDashboard = createRoute({
  method: "get",
  path: "/dashboard",
  tags,
  operationId: "getDashboard",
  responses: {
    200: {
      description: "ダッシュボード 1 画面ぶんのデータ",
      content: { "application/json": { schema: DashboardSchema } },
    },
  },
});

type ReadingBookRow = {
  id: number;
  title: string;
  author: string;
  status: string;
  total_pages: number;
  created_at: string;
  current_page: number;
  progress_updated_at: string;
};

type CountRow = { month: string; count: number; pages: number | null };

// 今月から MONTH_COUNT か月ぶんの "YYYY-MM" を新しい順に作る。
function recentMonths(now: Date): string[] {
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    return date.toISOString().slice(0, 7);
  });
}

// 読書中の本と進捗を 1 クエリで組にする。本ごとに /books/:bookId/progress を叩くと N+1 になる。
function readingBooks() {
  const rows = getDb()
    .prepare(
      `SELECT b.*, p.current_page, p.updated_at AS progress_updated_at
       FROM books b JOIN book_progress p ON p.book_id = b.id
       WHERE b.status = 'reading'
       ORDER BY b.created_at DESC, b.id DESC`,
    )
    .all() as ReadingBookRow[];

  return rows.map((row) => ({
    book: row,
    progress: {
      book_id: row.id,
      current_page: row.current_page,
      updated_at: row.progress_updated_at,
    },
  }));
}

function recentNotes() {
  return getDb()
    .prepare(
      `SELECT n.*, b.title AS book_title
       FROM book_notes n JOIN books b ON b.id = n.book_id
       ORDER BY n.created_at DESC, n.id DESC
       LIMIT ?`,
    )
    .all(RECENT_NOTE_LIMIT);
}

// 直近 MONTH_COUNT か月。データの無い月も 0 で含める。
function monthlyStats() {
  const db = getDb();
  const bookRows = db
    .prepare(
      `SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS count, SUM(total_pages) AS pages
       FROM books GROUP BY month`,
    )
    .all() as CountRow[];
  const noteRows = db
    .prepare(
      `SELECT substr(created_at, 1, 7) AS month, COUNT(*) AS count, NULL AS pages FROM book_notes GROUP BY month`,
    )
    .all() as CountRow[];

  const books = new Map(bookRows.map((row) => [row.month, row]));
  const notes = new Map(noteRows.map((row) => [row.month, row]));

  return recentMonths(new Date()).map((month) => ({
    month,
    books_added: books.get(month)?.count ?? 0,
    pages_added: books.get(month)?.pages ?? 0,
    notes_written: notes.get(month)?.count ?? 0,
  }));
}

// 画面 1 枚ぶんをまとめて返す。リソースではなく画面に紐づくので、パスも画面名になる (docs/backend.md §4)。
// 余分なフィールドは DashboardSchema.parse が落とすので、SELECT * の列がそのまま漏れることはない。
export const dashboard = createApp().openapi(getDashboard, (c) => {
  return c.json(
    DashboardSchema.parse({
      reading_books: readingBooks(),
      recent_notes: recentNotes(),
      monthly_stats: monthlyStats(),
    }),
    200,
  );
});
