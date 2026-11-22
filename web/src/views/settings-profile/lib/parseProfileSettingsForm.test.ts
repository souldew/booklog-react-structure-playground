import { describe, expect, it } from "vitest";

import { formDataOf } from "@/shared/fixtures/formDataOf";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";

import { BIO_MAX_LENGTH, DISPLAY_NAME_MAX_LENGTH } from "../model";
import { parseProfileSettingsForm } from "./parseProfileSettingsForm";

describe("parseProfileSettingsForm", () => {
  it("前後の空白を落として値を返す。自己紹介は空でよい", () => {
    const parsed = parseProfileSettingsForm(formDataOf({ displayName: " souldew ", bio: "  " }));

    expect(parsed.values).toEqual({ displayName: "souldew", bio: "" });
    expect(hasFieldErrors(parsed.fieldErrors)).toBe(false);
  });

  it("表示名が空ならエラーにし、入力値はそのまま残す", () => {
    const parsed = parseProfileSettingsForm(formDataOf({ displayName: " ", bio: "設計の本" }));

    expect(parsed.fieldErrors).toEqual({ displayName: "表示名を入力してください" });
    expect(parsed.values).toEqual({ displayName: "", bio: "設計の本" });
  });

  it("上限ちょうどは受け付け、1 文字超えたらエラーにする", () => {
    const atLimit = parseProfileSettingsForm(
      formDataOf({
        displayName: "あ".repeat(DISPLAY_NAME_MAX_LENGTH),
        bio: "い".repeat(BIO_MAX_LENGTH),
      }),
    );
    expect(hasFieldErrors(atLimit.fieldErrors)).toBe(false);

    const over = parseProfileSettingsForm(
      formDataOf({
        displayName: "あ".repeat(DISPLAY_NAME_MAX_LENGTH + 1),
        bio: "い".repeat(BIO_MAX_LENGTH + 1),
      }),
    );
    expect(over.fieldErrors).toEqual({
      displayName: `表示名は ${DISPLAY_NAME_MAX_LENGTH} 文字以内で入力してください`,
      bio: `自己紹介は ${BIO_MAX_LENGTH} 文字以内で入力してください`,
    });
  });
});
