import { getDb } from "../../db/client.ts";
import { BookSchema } from "../schemas.ts";

export function findBook(bookId: string) {
  const id = Number(bookId);
  if (!Number.isInteger(id)) return undefined;

  const row = getDb().prepare("SELECT * FROM books WHERE id = ?").get(id);
  return row ? BookSchema.parse(row) : undefined;
}
