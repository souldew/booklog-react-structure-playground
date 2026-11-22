"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/shared/components/FormField/FormField";

import { remainingBioLength } from "../../lib/remainingBioLength";
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  type ProfileSettingsFormAction,
  type ProfileSettingsFormValues,
} from "../../model";

type Props = {
  /** Server Action。id が無いので bind するものも無い。story では fn() で差し替える */
  action: ProfileSettingsFormAction;
  defaultValues: ProfileSettingsFormValues;
};

// 単一リソースの編集。book-progress-form と同じく作成が無く、常に「保存する」。
// 違いは保存後に画面を離れないことで、結果 (保存できた / 失敗した) をこのフォームの中に出す。
// 自己紹介だけは入力中の値を描画 (残り文字数) に使うので、useState で持つ制御コンポーネントにしている。
// 他の項目は defaultValue のままで、値は送信時に FormData から読む。
export function ProfileSettingsForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    values: defaultValues,
    fieldErrors: {},
  });
  const { values, fieldErrors, message, saved } = state;

  const [bio, setBio] = useState(values.bio);
  // action が値を返したら、自己紹介をその値に揃え直す (保存後は前後の空白が落ちた値になる)。
  // 制御コンポーネントは React の送信後のリセットの対象外なので、自分で揃える。
  // Effect ではなく描画中に比べて更新する (React の「props の変化で state を調整する」形)。
  const [syncedValues, setSyncedValues] = useState(values);
  if (syncedValues !== values) {
    setSyncedValues(values);
    setBio(values.bio);
  }
  const remaining = remainingBioLength(bio);
  // 検証のエラーは送信した値についてのもの。送信後に書き直したら、残り文字数の判定と食い違うので出さない。
  // 「書き直したか」は state を増やさず、action が返した値と今の入力を比べて導く。
  const bioError = bio === values.bio ? fieldErrors.bio : undefined;

  return (
    <form action={formAction} noValidate className="max-w-md space-y-4">
      <FormField
        id="displayName"
        label="表示名"
        error={fieldErrors.displayName}
        hint={`${DISPLAY_NAME_MAX_LENGTH} 文字以内`}
      >
        <Input
          id="displayName"
          name="displayName"
          defaultValue={values.displayName}
          aria-invalid={fieldErrors.displayName ? true : undefined}
          aria-describedby={fieldErrors.displayName ? "displayName-error" : undefined}
        />
      </FormField>

      <FormField id="bio" label="自己紹介" error={bioError}>
        <Textarea
          id="bio"
          name="bio"
          className="min-h-24"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          aria-invalid={bioError ? true : undefined}
          aria-describedby={bioError ? "bio-count bio-error" : "bio-count"}
        />
        {/* 入力のたびに数え直す。判定だけで送信は止めず、保存時の検証は Server Action が持つ */}
        <p
          id="bio-count"
          className={remaining < 0 ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
        >
          {remaining < 0
            ? `${-remaining} 文字オーバーしています (上限 ${BIO_MAX_LENGTH} 文字)`
            : `残り ${remaining} 文字`}
        </p>
      </FormField>

      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          保存する
        </Button>
        <p role="status" className="text-sm text-muted-foreground">
          {saved && !isPending ? "保存しました" : ""}
        </p>
      </div>
    </form>
  );
}
