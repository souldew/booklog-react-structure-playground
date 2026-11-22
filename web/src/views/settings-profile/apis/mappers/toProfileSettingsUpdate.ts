import type { ProfileSettingsUpdate } from "@/generated/model";

import type { ProfileSettingsFormValues } from "../../model";

// フォームの値 → 更新リクエストの生成型。単一リソースの PUT なので全項目を送る。
export function toProfileSettingsUpdate(values: ProfileSettingsFormValues): ProfileSettingsUpdate {
  return {
    display_name: values.displayName,
    bio: values.bio,
  };
}
