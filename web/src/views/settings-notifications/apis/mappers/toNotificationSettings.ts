import type { NotificationSettings as NotificationSettingsResponse } from "@/generated/model";

import type { NotificationSettings } from "../../model";

// 生成型 → ドメイン型。snake_case を camelCase にする。
export function toNotificationSettings(
  response: NotificationSettingsResponse,
): NotificationSettings {
  return {
    readingReminder: response.reading_reminder,
    weeklySummary: response.weekly_summary,
    noteDigest: response.note_digest,
  };
}
