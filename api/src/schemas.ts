import { z } from "@hono/zod-openapi";

// API のレスポンスは DB の列名に合わせて snake_case にする。
// web 側のドメイン型は camelCase なので、この差を mapper が埋める。

// 名前を Error にすると生成側でグローバルの Error と同名になるので ErrorResponse にする。
export const ErrorSchema = z
  .object({
    message: z.string(),
  })
  .openapi("ErrorResponse");

// on_hold は 2 語。生成側のキーは on_hold のままになり、web のドメイン型 onHold との差を mapper が埋める。
export const BookStatusSchema = z
  .enum(["unread", "reading", "on_hold", "finished"])
  .openapi("BookStatus");

export const BookSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    author: z.string(),
    status: BookStatusSchema,
    total_pages: z.number().int(),
    created_at: z.string(),
  })
  .openapi("Book");

export const BookCreateSchema = z
  .object({
    title: z.string().min(1),
    author: z.string().min(1),
    total_pages: z.number().int().positive(),
    status: BookStatusSchema.optional(),
  })
  .openapi("BookCreate");

export const BookUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    total_pages: z.number().int().positive().optional(),
    status: BookStatusSchema.optional(),
  })
  .openapi("BookUpdate");

export const BookNoteSchema = z
  .object({
    id: z.number().int(),
    book_id: z.number().int(),
    page: z.number().int(),
    body: z.string(),
    created_at: z.string(),
  })
  .openapi("BookNote");

export const BookNoteCreateSchema = z
  .object({
    page: z.number().int().nonnegative(),
    body: z.string().min(1),
  })
  .openapi("BookNoteCreate");

export const BookNoteUpdateSchema = z
  .object({
    page: z.number().int().nonnegative().optional(),
    body: z.string().min(1).optional(),
  })
  .openapi("BookNoteUpdate");

export const BookProgressSchema = z
  .object({
    book_id: z.number().int(),
    current_page: z.number().int(),
    updated_at: z.string(),
  })
  .openapi("BookProgress");

export const BookProgressUpdateSchema = z
  .object({
    current_page: z.number().int().nonnegative(),
  })
  .openapi("BookProgressUpdate");

export const BookIdParamSchema = z.object({
  bookId: z.string().openapi({ param: { name: "bookId", in: "path" }, example: "1" }),
});

export const NoteIdParamSchema = BookIdParamSchema.extend({
  noteId: z.string().openapi({ param: { name: "noteId", in: "path" }, example: "1" }),
});
