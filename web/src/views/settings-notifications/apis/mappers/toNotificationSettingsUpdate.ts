import type { NotificationSettingsUpdate } from "@/generated/model";

import type { NotificationSettingsFormValues } from "../../model";

// フォームの値 → 更新リクエストの生成型。PUT は置き換えなので、オフの種類も false として必ず送る。
export function toNotificationSettingsUpdate(
  values: NotificationSettingsFormValues,
): NotificationSettingsUpdate {
  return {
    reading_reminder: values.readingReminder,
    weekly_summary: values.weeklySummary,
    note_digest: values.noteDigest,
  };
}
