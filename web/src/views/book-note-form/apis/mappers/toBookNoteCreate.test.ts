import { describe, expect, it } from "vitest";

import { toBookNoteCreate } from "./toBookNoteCreate";

describe("toBookNoteCreate", () => {
  it("フォームの値を作成リクエストの生成型にする。ページは数値にする", () => {
    expect(toBookNoteCreate({ page: "48", body: "曳光弾" })).toEqual({ page: 48, body: "曳光弾" });
  });
});
