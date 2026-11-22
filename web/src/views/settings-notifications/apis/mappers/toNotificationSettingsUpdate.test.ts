import { describe, expect, it } from "vitest";

import { toNotificationSettingsUpdate } from "./toNotificationSettingsUpdate";

describe("toNotificationSettingsUpdate", () => {
  it("camelCase のフォームの値を snake_case の生成型にし、false の項目も落とさない", () => {
    expect(
      toNotificationSettingsUpdate({
        readingReminder: false,
        weeklySummary: true,
        noteDigest: false,
      }),
    ).toEqual({ reading_reminder: false, weekly_summary: true, note_digest: false });
  });
});
