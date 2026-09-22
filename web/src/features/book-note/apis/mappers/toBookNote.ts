import type { BookNote as BookNoteResponse } from "@/generated/model";

import type { BookNote } from "../../model";

export function toBookNote(response: BookNoteResponse): BookNote {
  return {
    id: String(response.id),
    bookId: String(response.book_id),
    page: response.page,
    body: response.body,
    createdAt: response.created_at,
  };
}
