"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { BOOK_STATUS_LABELS } from "@/features/book/constants";
import { BOOK_STATUSES } from "@/features/book/model";
import { FormField } from "@/shared/components/FormField/FormField";

import type { BookFormAction, BookFormValues } from "../../model";

type Props = {
  /** Server Action。story では fn() で差し替える */
  action: BookFormAction;
  defaultValues: BookFormValues;
  /** 状態を変えられなくする。編集画面で使う。disabled な select は送信されない (docs/backend.md §1) */
  statusLocked?: boolean;
  submitLabel: string;
};

// 作成と編集で共有する Presentational。差は props (defaultValues / statusLocked / submitLabel) と、
// 渡される action だけ。どちらの画面かは知らない。
// 送信後に React が form をリセットするので、入力欄の defaultValue は action が返した values から取り直す。
export function BookForm({ action, defaultValues, statusLocked = false, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    values: defaultValues,
    fieldErrors: {},
  });
  const { values, fieldErrors, message } = state;

  // 検証は Server Action 側に寄せる。ブラウザの制約検証 (min など) を切らないと、送信前に止まって
  // こちらのメッセージが出ないため。min はスピナーの下限としてだけ残す。
  return (
    <form action={formAction} noValidate className="max-w-md space-y-4">
      <FormField id="title" label="タイトル" error={fieldErrors.title}>
        <Input
          id="title"
          name="title"
          defaultValue={values.title}
          aria-invalid={fieldErrors.title ? true : undefined}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
      </FormField>

      <FormField id="author" label="著者" error={fieldErrors.author}>
        <Input
          id="author"
          name="author"
          defaultValue={values.author}
          aria-invalid={fieldErrors.author ? true : undefined}
          aria-describedby={fieldErrors.author ? "author-error" : undefined}
        />
      </FormField>

      <FormField id="totalPages" label="ページ数" error={fieldErrors.totalPages}>
        <Input
          id="totalPages"
          name="totalPages"
          type="number"
          inputMode="numeric"
          min={1}
          className="max-w-32"
          defaultValue={values.totalPages}
          aria-invalid={fieldErrors.totalPages ? true : undefined}
          aria-describedby={fieldErrors.totalPages ? "totalPages-error" : undefined}
        />
      </FormField>

      <FormField
        id="status"
        label="状態"
        error={fieldErrors.status}
        hint={statusLocked ? "状態は一覧の読了トグルで変えます" : undefined}
      >
        <NativeSelect
          id="status"
          name="status"
          defaultValue={values.status}
          disabled={statusLocked}
        >
          {BOOK_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {BOOK_STATUS_LABELS[status]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormField>

      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
