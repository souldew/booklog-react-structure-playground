import { describe, expect, it } from "vitest";

import { toBookCreate } from "./toBookCreate";

describe("toBookCreate", () => {
  it("フォームの値を作成リクエストの生成型にする。ページ数は数値、状態は API の語に変える", () => {
    expect(toBookCreate({ title: "t", author: "a", totalPages: "120", status: "onHold" })).toEqual({
      title: "t",
      author: "a",
      total_pages: 120,
      status: "on_hold",
    });
  });
});
