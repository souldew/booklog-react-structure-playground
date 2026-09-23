import { createRoute, z } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { MonthlyStatSchema } from "../schemas.ts";

const tags = ["stats"];
const MONTH_COUNT = 6;

const getMonthlyStats = createRoute({
  method: "get",
  path: "/stats/monthly",
  tags,
  operationId: "getMonthlyStats",
  responses: {
    200: {
      description: "直近 6 か月の月別統計。新しい月が先。データの無い月も 0 で含む",
      content: { "application/json": { schema: z.array(MonthlyStatSchema) } },
    },
  },
});

type CountRow = { month: string; count: number; pages: number | null };

// 今月から MONTH_COUNT か月ぶんの "YYYY-MM" を新しい順に作る。
function recentMonths(now: Date): string[] {
  return Array.from({ length: MONTH_COUNT }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    return date.toISOString().slice(0, 7);
  });
}

// ダッシュボードは集約エンドポイントを作らず、パネルごとに別々に叩く (docs/backend.md §4)。
export const stats = createApp().openapi(getMonthlyStats, (c) => {
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

  const result = recentMonths(new Date()).map((month) => ({
    month,
    books_added: books.get(month)?.count ?? 0,
    pages_added: books.get(month)?.pages ?? 0,
    notes_written: notes.get(month)?.count ?? 0,
  }));

  return c.json(z.array(MonthlyStatSchema).parse(result), 200);
});
