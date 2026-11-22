"use server";

import { revalidatePath } from "next/cache";

import { updateNotificationSettings as putNotificationSettings } from "@/generated/notification-settings/notification-settings";
import { routes } from "@/shared/routes/routes";

import { parseNotificationSettingsForm } from "../../lib/parseNotificationSettingsForm";
import type { NotificationSettingsFormState, NotificationSettingsFormValues } from "../../model";
import { toNotificationSettings } from "../mappers/toNotificationSettings";
import { toNotificationSettingsUpdate } from "../mappers/toNotificationSettingsUpdate";

// /settings/notifications の Server Action。id が無いので bind するものも無い。
// 戻り先の画面が無いので redirect せず、保存した値を返して同じ画面に留まる。
export async function updateNotificationSettings(
  _state: NotificationSettingsFormState,
  formData: FormData,
): Promise<NotificationSettingsFormState> {
  const values = parseNotificationSettingsForm(formData);

  let saved: NotificationSettingsFormValues;
  try {
    const response = await putNotificationSettings(toNotificationSettingsUpdate(values));
    saved = toNotificationSettings(response.data);
  } catch (error) {
    return { values, message: error instanceof Error ? error.message : "unknown error" };
  }

  revalidatePath(routes.settingsNotifications());
  return { values: saved, saved: true };
}
