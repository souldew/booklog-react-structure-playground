import { describe, expect, it } from "vitest";

import { routes } from "./routes";

// app/ のディレクトリ構成 (docs/screens.md §1) と一致することを、文字列で固定しておく。
describe("routes", () => {
  it("コレクション (notes) は複数形で下に id が付き、単一リソース (progress) は単数形で id が付かない", () => {
    expect(routes.bookNotes("1")).toBe("/books/1/notes");
    expect(routes.bookNoteNew("1")).toBe("/books/1/notes/new");
    expect(routes.bookNoteEdit("1", "5")).toBe("/books/1/notes/5/edit");
    expect(routes.bookProgress("1")).toBe("/books/1/progress");
  });

  it("本の一覧・作成・詳細・編集", () => {
    expect(routes.books()).toBe("/books");
    expect(routes.bookNew()).toBe("/books/new");
    expect(routes.bookDetail("1")).toBe("/books/1");
    expect(routes.bookEdit("1")).toBe("/books/1/edit");
  });
});
