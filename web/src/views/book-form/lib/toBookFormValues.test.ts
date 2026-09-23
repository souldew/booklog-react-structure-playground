import { describe, expect, it } from "vitest";

import { BOOK_FIXTURES } from "@/entities/book/fixtures/books";

import { toBookFormValues } from "./toBookFormValues";

describe("toBookFormValues", () => {
  it("ドメイン型をフォームの値にし、ページ数は文字列にする", () => {
    expect(toBookFormValues(BOOK_FIXTURES.onHold)).toEqual({
      title: "Clean Architecture",
      author: "Robert C. Martin",
      totalPages: "432",
      status: "onHold",
    });
  });
});
