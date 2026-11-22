import { describe, expect, it } from "vitest";

import { formDataOf } from "@/shared/fixtures/formDataOf";

import { BIO_MAX_LENGTH } from "../model";
import { parseProfileSettingsForm } from "./parseProfileSettingsForm";
import { remainingBioLength } from "./remainingBioLength";

describe("remainingBioLength", () => {
  it("上限から入力した文字数を引く", () => {
    expect(remainingBioLength("設計の本")).toBe(BIO_MAX_LENGTH - 4);
  });

  it("前後の空白は数えない", () => {
    expect(remainingBioLength("  設計  ")).toBe(BIO_MAX_LENGTH - 2);
  });

  it("上限を超えると負になる", () => {
    expect(remainingBioLength("あ".repeat(BIO_MAX_LENGTH + 3))).toBe(-3);
  });

  // 画面の判定と保存時の検証が食い違わないこと。
  it.each([BIO_MAX_LENGTH, BIO_MAX_LENGTH + 1])(
    "%i 文字のとき、0 以上かどうかが検証の結果と一致する",
    (length) => {
      const bio = ` ${"あ".repeat(length)} `;
      const parsed = parseProfileSettingsForm(formDataOf({ displayName: "souldew", bio }));

      expect(remainingBioLength(bio) >= 0).toBe(parsed.fieldErrors.bio === undefined);
    },
  );
});
