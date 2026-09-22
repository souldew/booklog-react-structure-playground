import { createRoute, z } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { findBook } from "../lib/findBook.ts";
import {
  BookIdParamSchema,
  BookNoteCreateSchema,
  BookNoteSchema,
  BookNoteUpdateSchema,
  ErrorSchema,
  NoteIdParamSchema,
} from "../schemas.ts";

const tags = ["book-notes"];
const notFound = {
  description: "本またはメモが無い",
  content: { "application/json": { schema: ErrorSchema } },
};

const listBookNotes = createRoute({
  method: "get",
  path: "/books/{bookId}/notes",
  tags,
  operationId: "listBookNotes",
  request: { params: BookIdParamSchema },
  responses: {
    200: {
      description: "本に付いたメモの一覧",
      content: { "application/json": { schema: z.array(BookNoteSchema) } },
    },
    404: notFound,
  },
});

const createBookNote = createRoute({
  method: "post",
  path: "/books/{bookId}/notes",
  tags,
  operationId: "createBookNote",
  request: {
    params: BookIdParamSchema,
    body: { required: true, content: { "application/json": { schema: BookNoteCreateSchema } } },
  },
  responses: {
    201: {
      description: "作成したメモ",
      content: { "application/json": { schema: BookNoteSchema } },
    },
    404: notFound,
  },
});

const updateBookNote = createRoute({
  method: "patch",
  path: "/books/{bookId}/notes/{noteId}",
  tags,
  operationId: "updateBookNote",
  request: {
    params: NoteIdParamSchema,
    body: { required: true, content: { "application/json": { schema: BookNoteUpdateSchema } } },
  },
  responses: {
    200: {
      description: "更新後のメモ",
      content: { "application/json": { schema: BookNoteSchema } },
    },
    404: notFound,
  },
});

const deleteBookNote = createRoute({
  method: "delete",
  path: "/books/{bookId}/notes/{noteId}",
  tags,
  operationId: "deleteBookNote",
  request: { params: NoteIdParamSchema },
  responses: {
    204: { description: "削除した" },
    404: notFound,
  },
});

function findNote(bookId: number, noteId: string) {
  const id = Number(noteId);
  if (!Number.isInteger(id)) return undefined;

  const row = getDb()
    .prepare("SELECT * FROM book_notes WHERE id = ? AND book_id = ?")
    .get(id, bookId);
  return row ? BookNoteSchema.parse(row) : undefined;
}

export const bookNotes = createApp()
  .openapi(listBookNotes, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);

    const rows = getDb()
      .prepare("SELECT * FROM book_notes WHERE book_id = ? ORDER BY page ASC, id ASC")
      .all(book.id);
    return c.json(z.array(BookNoteSchema).parse(rows), 200);
  })
  .openapi(createBookNote, (c) => {
    const book = findBook(c.req.valid("param").bookId);
    if (!book) return c.json({ message: "book not found" }, 404);

    const input = c.req.valid("json");
    const db = getDb();
    const { lastInsertRowid } = db
      .prepare(`INSERT INTO book_notes (book_id, page, body, created_at) VALUES (?, ?, ?, ?)`)
      .run(book.id, input.page, input.body, new Date().toISOString());

    const row = db.prepare("SELECT * FROM book_notes WHERE id = ?").get(lastInsertRowid);
    return c.json(BookNoteSchema.parse(row), 201);
  })
  .openapi(updateBookNote, (c) => {
    const { bookId, noteId } = c.req.valid("param");
    const book = findBook(bookId);
    if (!book) return c.json({ message: "book not found" }, 404);
    const note = findNote(book.id, noteId);
    if (!note) return c.json({ message: "note not found" }, 404);

    const merged = { ...note, ...c.req.valid("json") };
    getDb()
      .prepare("UPDATE book_notes SET page = ?, body = ? WHERE id = ?")
      .run(merged.page, merged.body, note.id);

    return c.json(BookNoteSchema.parse(merged), 200);
  })
  .openapi(deleteBookNote, (c) => {
    const { bookId, noteId } = c.req.valid("param");
    const book = findBook(bookId);
    if (!book) return c.json({ message: "book not found" }, 404);
    const note = findNote(book.id, noteId);
    if (!note) return c.json({ message: "note not found" }, 404);

    getDb().prepare("DELETE FROM book_notes WHERE id = ?").run(note.id);
    return c.body(null, 204);
  });
