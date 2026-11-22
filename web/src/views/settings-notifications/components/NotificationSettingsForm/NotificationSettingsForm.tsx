"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import {
  NOTIFICATION_KINDS,
  type NotificationKind,
  type NotificationSettingsFormAction,
  type NotificationSettingsFormValues,
} from "../../model";

type Props = {
  /** Server Action。id が無いので bind するものも無い。story では fn() で差し替える */
  action: NotificationSettingsFormAction;
  defaultValues: NotificationSettingsFormValues;
};

// 種類を足したときに文言の書き忘れが型エラーになるよう、satisfies で全種類を要求する。
const KIND_TEXTS = {
  readingReminder: {
    label: "読書のリマインダー",
    description: "読書中の本を 3 日開かなかったときに知らせる",
  },
  weeklySummary: {
    label: "週のまとめ",
    description: "1 週間に読んだページ数と書いたメモを送る",
  },
  noteDigest: {
    label: "メモの振り返り",
    description: "過去に書いたメモを月に 1 回まとめて送る",
  },
} satisfies Record<NotificationKind, { label: string; description: string }>;

// checkbox は送信時にチェックが外れていると FormData に含まれない。その解釈は Server Action 側 (parse) が持ち、
// この部品は defaultChecked で初期状態を描くだけ。項目ごとのエラーは起こり得ないので FormField は使わない。
export function NotificationSettingsForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, { values: defaultValues });
  const { values, message, saved } = state;

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <fieldset className="space-y-3">
        <legend className="sr-only">受け取る通知</legend>
        {NOTIFICATION_KINDS.map((kind) => (
          <div key={kind} className="flex items-start gap-3">
            <input
              id={kind}
              name={kind}
              type="checkbox"
              defaultChecked={values[kind]}
              aria-describedby={`${kind}-description`}
              className="mt-0.5 size-4 accent-primary"
            />
            <div className="space-y-0.5">
              <label htmlFor={kind} className="block text-sm font-medium">
                {KIND_TEXTS[kind].label}
              </label>
              <p id={`${kind}-description`} className="text-xs text-muted-foreground">
                {KIND_TEXTS[kind].description}
              </p>
            </div>
          </div>
        ))}
      </fieldset>

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
