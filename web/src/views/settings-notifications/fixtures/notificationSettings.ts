import type { NotificationSettings } from "../model";

// story とテストで使う NotificationSettings。api のシードと同じ値。
export const NOTIFICATION_SETTINGS_FIXTURE: NotificationSettings = {
  readingReminder: true,
  weeklySummary: true,
  noteDigest: false,
};
