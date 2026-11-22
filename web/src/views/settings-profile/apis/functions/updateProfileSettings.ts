"use server";

import { revalidatePath } from "next/cache";

import { updateProfileSettings as putProfileSettings } from "@/generated/profile-settings/profile-settings";
import { hasFieldErrors } from "@/shared/lib/fieldErrors";
import { routes } from "@/shared/routes/routes";

import { parseProfileSettingsForm } from "../../lib/parseProfileSettingsForm";
import { toProfileSettingsFormValues } from "../../lib/toProfileSettingsFormValues";
import type { ProfileSettingsFormState, ProfileSettingsFormValues } from "../../model";
import { toProfileSettings } from "../mappers/toProfileSettings";
import { toProfileSettingsUpdate } from "../mappers/toProfileSettingsUpdate";

// /settings/profile の Server Action。ユーザーは 1 人で id が無いので、Container が bind するものも無い。
// 戻り先の画面 (詳細や一覧) が無いので redirect せず、保存した値を返して同じ画面に留まる。
export async function updateProfileSettings(
  _state: ProfileSettingsFormState,
  formData: FormData,
): Promise<ProfileSettingsFormState> {
  const { values, fieldErrors } = parseProfileSettingsForm(formData);
  if (hasFieldErrors(fieldErrors)) return { values, fieldErrors };

  let saved: ProfileSettingsFormValues;
  try {
    const response = await putProfileSettings(toProfileSettingsUpdate(values));
    saved = toProfileSettingsFormValues(toProfileSettings(response.data));
  } catch (error) {
    return {
      values,
      fieldErrors: {},
      message: error instanceof Error ? error.message : "unknown error",
    };
  }

  revalidatePath(routes.settingsProfile());
  return { values: saved, fieldErrors: {}, saved: true };
}
