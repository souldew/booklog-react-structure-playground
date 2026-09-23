import { describe, expect, it } from "vitest";

import type { BookReadingStat as BookReadingStatResponse } from "@/generated/model";

import { toBookReadingStat } from "./toBookReadingStat";

describe("toBookReadingStat", () => {
  it("snake_case の生成型を camelCase のドメイン型にする", () => {
    const response: BookReadingStatResponse = {
      month: "2026-09",
      books_added: 2,
      pages_added: 760,
      notes_written: 3,
    };

    expect(toBookReadingStat(response)).toEqual({
      month: "2026-09",
      booksAdded: 2,
      pagesAdded: 760,
      notesWritten: 3,
    });
  });
});
