import { firstFieldErrors } from "@/shared/lib/fieldErrors";

import {
  type ProfileSettingsFormFieldErrors,
  ProfileSettingsFormSchema,
  type ProfileSettingsFormValues,
} from "../model";

export type ParsedProfileSettingsForm = {
  /** 再表示用の値。前後の空白だけ落としてある */
  values: ProfileSettingsFormValues;
  fieldErrors: ProfileSettingsFormFieldErrors;
};

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// FormData を ProfileSettingsFormSchema で検証してフォームの値にする。API の型には触らない (それは apis/mappers の仕事)。
export function parseProfileSettingsForm(formData: FormData): ParsedProfileSettingsForm {
  const raw = {
    displayName: text(formData, "displayName"),
    bio: text(formData, "bio"),
  };

  const result = ProfileSettingsFormSchema.safeParse(raw);
  if (result.success) {
    return { values: result.data, fieldErrors: {} };
  }

  return {
    values: { displayName: raw.displayName.trim(), bio: raw.bio.trim() },
    fieldErrors: firstFieldErrors(ProfileSettingsFormSchema, result.error),
  };
}
