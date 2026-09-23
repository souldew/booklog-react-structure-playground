import { describe, expect, it } from "vitest";

import { formDataOf } from "@/shared/fixtures/formDataOf";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";

import { parseBookNoteForm } from "./parseBookNoteForm";

describe("parseBookNoteForm", () => {
  it("前後の空白を落とし、値とエラー無しを返す。本文の中の改行は残す", () => {
    const parsed = parseBookNoteForm(formDataOf({ page: " 48 ", body: " 曳光弾。\n捨てない。 " }));

    expect(parsed.values).toEqual({ page: "48", body: "曳光弾。\n捨てない。" });
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("ページは 0 を受け付ける。読み始める前のメモに付けるため", () => {
    const parsed = parseBookNoteForm(formDataOf({ page: "0", body: "b" }));

    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("項目ごとにメッセージを返し、入力値はそのまま残す", () => {
    const parsed = parseBookNoteForm(formDataOf({ page: "abc", body: "   " }));

    expect(parsed.fieldErrors).toEqual({
      page: "ページは 0 以上の整数で入力してください",
      body: "本文を入力してください",
    });
    expect(parsed.values.page).toBe("abc");
  });

  it.each(["-1", "1.5", ""])("ページ %j は受け付けない", (page) => {
    const parsed = parseBookNoteForm(formDataOf({ page, body: "b" }));

    expect(parsed.fieldErrors.page).toBe("ページは 0 以上の整数で入力してください");
  });

  it("項目が FormData に無ければ空として扱う", () => {
    const parsed = parseBookNoteForm(formDataOf({}));

    expect(parsed.values).toEqual({ page: "", body: "" });
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(true);
  });
});
