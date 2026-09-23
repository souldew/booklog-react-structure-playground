import { describe, expect, it } from "vitest";

import { formDataOf } from "@/shared/fixtures/formDataOf";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";

import { parseBookProgressForm } from "./parseBookProgressForm";

describe("parseBookProgressForm", () => {
  it("前後の空白を落として値を返す", () => {
    const parsed = parseBookProgressForm(formDataOf({ currentPage: " 120 " }), 420);

    expect(parsed.values).toEqual({ currentPage: "120" });
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it.each(["0", "420"])("下限 0 と上限 (ページ数) の %j は受け付ける", (currentPage) => {
    const parsed = parseBookProgressForm(formDataOf({ currentPage }), 420);

    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("ページ数を超えたら業務ルールのメッセージを返し、入力値はそのまま残す", () => {
    const parsed = parseBookProgressForm(formDataOf({ currentPage: "421" }), 420);

    expect(parsed.fieldErrors).toEqual({
      currentPage: "現在のページはページ数 (420) 以下で入力してください",
    });
    expect(parsed.values.currentPage).toBe("421");
  });

  it.each(["-1", "1.5", "abc", ""])("%j は整数ではないので受け付けない", (currentPage) => {
    const parsed = parseBookProgressForm(formDataOf({ currentPage }), 420);

    expect(parsed.fieldErrors.currentPage).toBe("現在のページは 0 以上の整数で入力してください");
  });
});
