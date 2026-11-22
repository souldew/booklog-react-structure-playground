import { describe, expect, it } from "vitest";

import { toNotificationSettings } from "./toNotificationSettings";

describe("toNotificationSettings", () => {
  it("snake_case の生成型を camelCase のドメイン型にする", () => {
    expect(
      toNotificationSettings({ reading_reminder: true, weekly_summary: false, note_digest: true }),
    ).toEqual({ readingReminder: true, weeklySummary: false, noteDigest: true });
  });
});
