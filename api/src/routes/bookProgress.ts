import { createRoute } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { findBook } from "../lib/findBook.ts";
import {
  BookIdParamSchema,
  BookProgressSchema,
  BookProgressUpdateSchema,
  ErrorSchema,
} from "../schemas.ts";

// 進捗は本 1 冊につき 1 つの単一リソース。
// パスに :progressId は無く、PUT で置き換える。
const tags = ["book-progress"];
const notFound = {
  description: "本が無い",
  content: { "application/json": { schema: ErrorSchema } },
};

const getBookProgress = createRoute({
  method: "get",
  path: "/books/{bookId}/progress",
  tags,
  operationId: "getBookProgress",
  request: { params: BookIdParamSchema },
  responses: {
    200: {
      description: "本の読書進捗",
      content: { "application/json": { schema: BookProgressSchema } },
    },
    404: notFound,
  },
});

const updateBookProgress = createRoute({
  method: "put",
  path: "/books/{bookId}/progress",
  tags,
  operationId: "updateBookProgress",
  request: {
    params: BookIdParamSchema,
    body: {
      required: true,
      content: { "application/json": { schema: BookProgressUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "更新後の読書進捗",
      content: { "application/json": { schema: BookProgressSchema } },
    },
    404: notFound,
  },
});

export const bookProgress = createApp()
  .openapi(getBookProgress, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);

    const row = getDb().prepare("SELECT * FROM book_progress WHERE book_id = ?").get(book.id);
    return c.json(BookProgressSchema.parse(row), 200);
  })
  .openapi(updateBookProgress, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);

    const { current_page } = c.req.valid("json");
    const db = getDb();
    db.prepare(
      `INSERT INTO book_progress (book_id, current_page, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(book_id) DO UPDATE SET
         current_page = excluded.current_page,
         updated_at = excluded.updated_at`,
    ).run(book.id, current_page, new Date().toISOString());

    const row = db.prepare("SELECT * FROM book_progress WHERE book_id = ?").get(book.id);
    return c.json(BookProgressSchema.parse(row), 200);
  });
