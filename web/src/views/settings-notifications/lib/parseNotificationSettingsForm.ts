import { NOTIFICATION_KINDS, type NotificationSettingsFormValues } from "../model";

// FormData をフォームの値にする。チェックを外した checkbox は FormData に含まれないので、キーが無いことを false と読む。
// book-form の disabled な select (送られない = 変えない、PATCH で既存値を保つ) とは逆で、
// ここでは送られない = オフ、PUT で false に置き換える。不正な値は入り得ないので検証は無い。
export function parseNotificationSettingsForm(formData: FormData): NotificationSettingsFormValues {
  return Object.fromEntries(
    NOTIFICATION_KINDS.map((kind) => [kind, formData.has(kind)]),
  ) as NotificationSettingsFormValues;
}
