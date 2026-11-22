import { z } from "zod";

import type { FieldErrors } from "@/shared/lib/fieldErrors";

// プロフィールのドメイン型。ユーザーにつき 1 つで id を持たない (docs/screens.md §4)。
// 使う画面がこの view だけなので entities には置かない (docs/directory-conventions.md §1「該当物が出るまで作らない」)。
export type ProfileSettings = {
  displayName: string;
  bio: string;
};

// フォームの値の型。いまは ProfileSettings と同じ形だが、Presentational が知るのはこちらだけにする。
export type ProfileSettingsFormValues = {
  displayName: string;
  bio: string;
};

export const DISPLAY_NAME_MAX_LENGTH = 30;
export const BIO_MAX_LENGTH = 160;

// FormData から読んだ文字列を検証するスキーマ。検証は Server Action の中で行う (docs/tech-stack.md §5)。
// 自己紹介は空でよい。
export const ProfileSettingsFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "表示名を入力してください")
    .max(DISPLAY_NAME_MAX_LENGTH, `表示名は ${DISPLAY_NAME_MAX_LENGTH} 文字以内で入力してください`),
  bio: z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `自己紹介は ${BIO_MAX_LENGTH} 文字以内で入力してください`),
});

type ProfileSettingsFormFieldName = keyof z.infer<typeof ProfileSettingsFormSchema>;

export type ProfileSettingsFormFieldErrors = FieldErrors<ProfileSettingsFormFieldName>;

// useActionState が持つ状態。戻り先の画面が無いので、成功しても redirect せずにこの型を返す。
export type ProfileSettingsFormState = {
  values: ProfileSettingsFormValues;
  fieldErrors: ProfileSettingsFormFieldErrors;
  /** 項目に紐づかない失敗 (API のエラーなど) */
  message?: string;
  /** 直前の送信で保存できたとき true。次の送信の結果で消える */
  saved?: boolean;
};

export type ProfileSettingsFormAction = (
  state: ProfileSettingsFormState,
  formData: FormData,
) => Promise<ProfileSettingsFormState>;
