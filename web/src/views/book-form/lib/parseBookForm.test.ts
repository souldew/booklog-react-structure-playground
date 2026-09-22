import { describe, expect, it } from "vitest";

import { EMPTY_BOOK_FORM_VALUES } from "../model";
import { hasFieldErrors, parseBookForm } from "./parseBookForm";

function formDataOf(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(entries)) formData.set(name, value);
  return formData;
}

describe("parseBookForm", () => {
  it("前後の空白を落とし、値とエラー無しを返す", () => {
    const parsed = parseBookForm(
      formDataOf({
        title: " 達人プログラマー ",
        author: "David Thomas",
        totalPages: "420",
        status: "reading",
      }),
      EMPTY_BOOK_FORM_VALUES,
    );

    expect(parsed.values).toEqual({
      title: "達人プログラマー",
      author: "David Thomas",
      totalPages: "420",
      status: "reading",
    });
    expect(parsed.submittedStatus).toBe("reading");
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("必須とページ数の検証に落ちた項目ごとにメッセージを返し、入力値はそのまま残す", () => {
    const parsed = parseBookForm(
      formDataOf({ title: "", author: "  ", totalPages: "abc" }),
      EMPTY_BOOK_FORM_VALUES,
    );

    expect(parsed.fieldErrors).toEqual({
      title: "タイトルを入力してください",
      author: "著者を入力してください",
      totalPages: "ページ数は 1 以上の整数で入力してください",
    });
    expect(parsed.values.totalPages).toBe("abc");
  });

  it.each(["0", "-1", "1.5", ""])("ページ数 %j は受け付けない", (totalPages) => {
    const parsed = parseBookForm(
      formDataOf({ title: "t", author: "a", totalPages }),
      EMPTY_BOOK_FORM_VALUES,
    );

    expect(parsed.fieldErrors.totalPages).toBe("ページ数は 1 以上の整数で入力してください");
  });

  // disabled な select は FormData に含まれない (docs/backend.md §1)。
  it("status が送られてこなければ、エラーにせず previous の値を引き継ぎ、submittedStatus は undefined", () => {
    const previous = { ...EMPTY_BOOK_FORM_VALUES, status: "onHold" as const };

    const parsed = parseBookForm(
      formDataOf({ title: "t", author: "a", totalPages: "10" }),
      previous,
    );

    expect(parsed.values.status).toBe("onHold");
    expect(parsed.submittedStatus).toBeUndefined();
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("知らない status の値はエラーにする。画面から送られることは無く、改ざんか実装ミス", () => {
    const parsed = parseBookForm(
      formDataOf({ title: "t", author: "a", totalPages: "10", status: "on_hold" }),
      EMPTY_BOOK_FORM_VALUES,
    );

    expect(parsed.fieldErrors.status).toBeDefined();
    expect(parsed.submittedStatus).toBeUndefined();
  });
});
