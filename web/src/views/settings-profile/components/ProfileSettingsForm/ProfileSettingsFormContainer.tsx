import { fetchProfileSettings } from "../../apis/functions/fetchProfileSettings";
import { updateProfileSettings } from "../../apis/functions/updateProfileSettings";
import { toProfileSettingsFormValues } from "../../lib/toProfileSettingsFormValues";
import { ProfileSettingsForm } from "./ProfileSettingsForm";

// 取得して初期値にするだけ。URL に id が無く、行は必ずあるので notFound() の分岐も bind も無い。
export async function ProfileSettingsFormContainer() {
  const settings = await fetchProfileSettings();

  return (
    <ProfileSettingsForm
      action={updateProfileSettings}
      defaultValues={toProfileSettingsFormValues(settings)}
    />
  );
}
