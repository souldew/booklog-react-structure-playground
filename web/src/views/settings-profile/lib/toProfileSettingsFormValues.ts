import type { ProfileSettings, ProfileSettingsFormValues } from "../model";

// ドメイン型 → フォームの値。いまは同じ形なので写すだけ。
export function toProfileSettingsFormValues(settings: ProfileSettings): ProfileSettingsFormValues {
  return { displayName: settings.displayName, bio: settings.bio };
}
