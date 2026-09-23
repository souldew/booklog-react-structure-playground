import { describe, expect, it } from "vitest";
import { z } from "zod";

import { firstFieldErrors, hasFieldErrors } from "./fieldErrors";

const schema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(3, "長すぎます"),
  page: z.string().regex(/^\d+$/, "数字で入力してください"),
});

describe("firstFieldErrors", () => {
  it("項目ごとに最初のメッセージだけを返し、エラーの無い項目はキーごと作らない", () => {
    const result = schema.safeParse({ title: "", page: "12" });
    if (result.success) throw new Error("落ちるはず");

    const fieldErrors = firstFieldErrors(schema, result.error);

    expect(fieldErrors).toEqual({ title: "タイトルを入力してください" });
    expect("page" in fieldErrors).toBe(false);
    expect(hasFieldErrors(fieldErrors)).toBe(true);
  });

  it("複数のメッセージがある項目は最初の 1 つだけ", () => {
    const result = schema.safeParse({ title: "", page: "x" });
    if (result.success) throw new Error("落ちるはず");

    expect(firstFieldErrors(schema, result.error)).toEqual({
      title: "タイトルを入力してください",
      page: "数字で入力してください",
    });
  });
});

describe("hasFieldErrors", () => {
  it("空なら false", () => {
    expect(hasFieldErrors({})).toBe(false);
  });
});
