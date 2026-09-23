import { describe, expect, it } from "vitest";

import { BOOK_PROGRESS_FIXTURE } from "@/features/book-progress/fixtures/bookProgress";

import { toBookProgressFormValues } from "./toBookProgressFormValues";

describe("toBookProgressFormValues", () => {
  it("現在のページを文字列にする", () => {
    expect(toBookProgressFormValues(BOOK_PROGRESS_FIXTURE)).toEqual({ currentPage: "120" });
  });
});
