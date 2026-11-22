import { describe, expect, it } from "vitest";

import { formDataOf } from "@/shared/fixtures/formDataOf";

import { parseNotificationSettingsForm } from "./parseNotificationSettingsForm";

describe("parseNotificationSettingsForm", () => {
  it("送られたキーは true、送られなかった (チェックを外した) キーは false にする", () => {
    expect(parseNotificationSettingsForm(formDataOf({ weeklySummary: "on" }))).toEqual({
      readingReminder: false,
      weeklySummary: true,
      noteDigest: false,
    });
  });

  it("何も送られなければ全部 false", () => {
    expect(parseNotificationSettingsForm(formDataOf({}))).toEqual({
      readingReminder: false,
      weeklySummary: false,
      noteDigest: false,
    });
  });

  it("通知の種類に無いキーは無視する", () => {
    const values = parseNotificationSettingsForm(formDataOf({ unknown: "on", noteDigest: "on" }));

    expect(values).toEqual({ readingReminder: false, weeklySummary: false, noteDigest: true });
  });
});
