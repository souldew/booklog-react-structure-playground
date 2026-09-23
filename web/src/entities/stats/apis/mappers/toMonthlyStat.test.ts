import { describe, expect, it } from "vitest";

import type { MonthlyStat as MonthlyStatResponse } from "@/generated/model";

import { toMonthlyStat } from "./toMonthlyStat";

describe("toMonthlyStat", () => {
  it("snake_case の生成型を camelCase のドメイン型にする", () => {
    const response: MonthlyStatResponse = {
      month: "2026-09",
      books_added: 2,
      pages_added: 760,
      notes_written: 3,
    };

    expect(toMonthlyStat(response)).toEqual({
      month: "2026-09",
      booksAdded: 2,
      pagesAdded: 760,
      notesWritten: 3,
    });
  });
});
