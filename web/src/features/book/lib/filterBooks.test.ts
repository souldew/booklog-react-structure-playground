import { describe, expect, it } from "vitest";

import { BOOK_FIXTURE_LIST, BOOK_FIXTURES } from "../fixtures/books";
import { EMPTY_BOOK_FILTER } from "../model";
import { filterBooks } from "./filterBooks";

describe("filterBooks", () => {
  it("条件が空なら全件を返す", () => {
    expect(filterBooks(BOOK_FIXTURE_LIST, EMPTY_BOOK_FILTER)).toEqual(BOOK_FIXTURE_LIST);
  });

  it("状態で絞り込む", () => {
    expect(filterBooks(BOOK_FIXTURE_LIST, { status: "finished", keyword: "" })).toEqual([
      BOOK_FIXTURES.finished,
    ]);
  });

  it("キーワードはタイトルと著者に対して大文字小文字を無視した部分一致で、前後の空白は無視する", () => {
    expect(filterBooks(BOOK_FIXTURE_LIST, { status: "all", keyword: "  clean  " })).toEqual([
      BOOK_FIXTURES.onHold,
    ]);
    expect(filterBooks(BOOK_FIXTURE_LIST, { status: "all", keyword: "boris" })).toEqual([
      BOOK_FIXTURES.finished,
    ]);
  });

  it("状態とキーワードは AND で効く", () => {
    expect(filterBooks(BOOK_FIXTURE_LIST, { status: "unread", keyword: "boris" })).toEqual([]);
  });
});
