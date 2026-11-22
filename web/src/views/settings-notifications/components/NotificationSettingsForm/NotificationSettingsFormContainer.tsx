import { fetchNotificationSettings } from "../../apis/functions/fetchNotificationSettings";
import { updateNotificationSettings } from "../../apis/functions/updateNotificationSettings";
import { NotificationSettingsForm } from "./NotificationSettingsForm";

// 取得して初期値にするだけ。URL に id が無く、行は必ずあるので notFound() の分岐も bind も無い。
// ドメイン型とフォームの値が同じ形 (真偽値のまま) なので、toXxxFormValues を挟まずにそのまま渡す。
export async function NotificationSettingsFormContainer() {
  const settings = await fetchNotificationSettings();

  return <NotificationSettingsForm action={updateNotificationSettings} defaultValues={settings} />;
}
