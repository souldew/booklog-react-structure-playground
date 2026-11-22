import { getNotificationSettings } from "@/generated/notification-settings/notification-settings";

import type { NotificationSettings } from "../../model";
import { toNotificationSettings } from "../mappers/toNotificationSettings";

// 単一リソースで、ユーザーは 1 人だけなので引数が無い。行は必ずあるので 404 の分岐も無く、失敗はそのまま投げる。
export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const response = await getNotificationSettings();
  return toNotificationSettings(response.data);
}
