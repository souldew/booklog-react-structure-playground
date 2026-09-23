import { describe, expect, it } from "vitest";

import { toBookNoteUpdate } from "./toBookNoteUpdate";

describe("toBookNoteUpdate", () => {
  it("全項目を送る。disabled な項目が無いので外す判断は無い", () => {
    expect(toBookNoteUpdate({ page: "48", body: "曳光弾" })).toEqual({ page: 48, body: "曳光弾" });
  });
});
