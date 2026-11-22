import { getProfileSettings } from "@/generated/profile-settings/profile-settings";

import type { ProfileSettings } from "../../model";
import { toProfileSettings } from "../mappers/toProfileSettings";

// 単一リソースで、ユーザーは 1 人だけなので引数が無い。行は必ずあるので 404 の分岐も無く、失敗はそのまま投げる。
export async function fetchProfileSettings(): Promise<ProfileSettings> {
  const response = await getProfileSettings();
  return toProfileSettings(response.data);
}
