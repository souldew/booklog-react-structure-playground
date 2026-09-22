import { createRoute, z } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { findBook } from "../lib/findBook.ts";
import {
  BookCreateSchema,
  BookIdParamSchema,
  BookSchema,
  BookStatusSchema,
  BookUpdateSchema,
  ErrorSchema,
} from "../schemas.ts";

const tags = ["books"];

const listBooks = createRoute({
  method: "get",
  path: "/books",
  tags,
  operationId: "listBooks",
  request: {
    query: z.object({
      status: BookStatusSchema.optional(),
      keyword: z.string().optional().openapi({ description: "title と author の部分一致" }),
    }),
  },
  responses: {
    200: {
      description: "本の一覧",
      content: { "application/json": { schema: z.array(BookSchema) } },
    },
  },
});

const createBook = createRoute({
  method: "post",
  path: "/books",
  tags,
  operationId: "createBook",
  request: {
    body: { required: true, content: { "application/json": { schema: BookCreateSchema } } },
  },
  responses: {
    201: {
      description: "作成した本",
      content: { "application/json": { schema: BookSchema } },
    },
  },
});

const getBook = createRoute({
  method: "get",
  path: "/books/{bookId}",
  tags,
  operationId: "getBook",
  request: { params: BookIdParamSchema },
  responses: {
    200: {
      description: "本の詳細",
      content: { "application/json": { schema: BookSchema } },
    },
    404: { description: "本が無い", content: { "application/json": { schema: ErrorSchema } } },
  },
});

const updateBook = createRoute({
  method: "patch",
  path: "/books/{bookId}",
  tags,
  operationId: "updateBook",
  request: {
    params: BookIdParamSchema,
    body: { required: true, content: { "application/json": { schema: BookUpdateSchema } } },
  },
  responses: {
    200: {
      description: "更新後の本",
      content: { "application/json": { schema: BookSchema } },
    },
    404: { description: "本が無い", content: { "application/json": { schema: ErrorSchema } } },
  },
});

export const books = createApp()
  .openapi(listBooks, (c) => {
    const { status, keyword } = c.req.valid("query");
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (keyword) {
      conditions.push("(title LIKE ? OR author LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = getDb()
      .prepare(`SELECT * FROM books ${where} ORDER BY created_at DESC, id DESC`)
      .all(...params);

    return c.json(z.array(BookSchema).parse(rows), 200);
  })
  .openapi(createBook, (c) => {
    const input = c.req.valid("json");
    const now = new Date().toISOString();
    const db = getDb();

    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO books (title, author, status, total_pages, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(input.title, input.author, input.status ?? "unread", input.total_pages, now);
    db.prepare(
      `INSERT INTO book_progress (book_id, current_page, updated_at) VALUES (?, 0, ?)`,
    ).run(lastInsertRowid, now);

    const row = db.prepare("SELECT * FROM books WHERE id = ?").get(lastInsertRowid);
    return c.json(BookSchema.parse(row), 201);
  })
  .openapi(getBook, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);
    return c.json(book, 200);
  })
  .openapi(updateBook, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);

    const input = c.req.valid("json");
    const merged = { ...book, ...input };
    getDb()
      .prepare(`UPDATE books SET title = ?, author = ?, status = ?, total_pages = ? WHERE id = ?`)
      .run(merged.title, merged.author, merged.status, merged.total_pages, book.id);

    return c.json(BookSchema.parse(merged), 200);
  });
