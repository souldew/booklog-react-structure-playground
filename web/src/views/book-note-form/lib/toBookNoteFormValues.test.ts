import { describe, expect, it } from "vitest";

import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";

import { toBookNoteFormValues } from "./toBookNoteFormValues";

describe("toBookNoteFormValues", () => {
  it("ドメイン型をフォームの値にし、ページは文字列にする。id と bookId は含めない", () => {
    expect(toBookNoteFormValues(BOOK_NOTE_FIXTURES[0]!)).toEqual({
      page: "12",
      body: "DRY 原則。知識の重複を避ける。コードの重複そのものが悪いわけではない。",
    });
  });
});
