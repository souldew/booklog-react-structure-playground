import { createRoute, z } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { RecentBookNoteSchema } from "../schemas.ts";

const tags = ["notes"];
const DEFAULT_LIMIT = 5;

const listRecentNotes = createRoute({
  method: "get",
  path: "/notes/recent",
  tags,
  operationId: "listRecentNotes",
  request: {
    query: z.object({
      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(20)
        .optional()
        .openapi({ description: `件数。既定は ${DEFAULT_LIMIT}`, example: DEFAULT_LIMIT }),
    }),
  },
  responses: {
    200: {
      description: "本を横断した最近のメモ。新しい順",
      content: { "application/json": { schema: z.array(RecentBookNoteSchema) } },
    },
  },
});

// /books/:bookId/notes は 1 冊のメモ。こちらは本を横断するので、リソースの親が違う (/notes)。
export const notes = createApp().openapi(listRecentNotes, (c) => {
  const { limit } = c.req.valid("query");
  const rows = getDb()
    .prepare(
      `SELECT n.*, b.title AS book_title
       FROM book_notes n JOIN books b ON b.id = n.book_id
       ORDER BY n.created_at DESC, n.id DESC
       LIMIT ?`,
    )
    .all(limit ?? DEFAULT_LIMIT);

  return c.json(z.array(RecentBookNoteSchema).parse(rows), 200);
});
