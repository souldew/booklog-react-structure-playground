import type { ProfileSettings as ProfileSettingsResponse } from "@/generated/model";

import type { ProfileSettings } from "../../model";

// 生成型 → ドメイン型。snake_case を camelCase にする。
export function toProfileSettings(response: ProfileSettingsResponse): ProfileSettings {
  return {
    displayName: response.display_name,
    bio: response.bio,
  };
}
