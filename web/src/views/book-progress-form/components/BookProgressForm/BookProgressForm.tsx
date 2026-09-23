"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/shared/components/FormField/FormField";
import { formatDate } from "@/shared/lib/formatDate";

import type { BookProgressFormAction, BookProgressFormValues } from "../../model";

type Props = {
  /** Server Action。bookId と totalPages は bind 済み。story では fn() で差し替える */
  action: BookProgressFormAction;
  defaultValues: BookProgressFormValues;
  /** 本のページ数。上限の表示に使う。検証は Server Action 側で行う */
  totalPages: number;
  /** 進捗の最終更新 (ISO 8601) */
  updatedAt: string;
};

// 単一リソースの編集。作成が無いので new / edit の分岐も submitLabel の差も無く、常に「保存する」。
// 本 (totalPages) と進捗 (defaultValues / updatedAt) の 2 つのドメインの値を受けるが、
// 合成したのは Container で、この部品は渡された値を描くだけ。
export function BookProgressForm({ action, defaultValues, totalPages, updatedAt }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    values: defaultValues,
    fieldErrors: {},
  });
  const { values, fieldErrors, message } = state;

  return (
    <form action={formAction} noValidate className="max-w-md space-y-4">
      <FormField
        id="currentPage"
        label="現在のページ"
        error={fieldErrors.currentPage}
        hint={`全 ${totalPages} ページ。最終更新 ${formatDate(updatedAt)}`}
      >
        <Input
          id="currentPage"
          name="currentPage"
          type="number"
          inputMode="numeric"
          min={0}
          max={totalPages}
          className="max-w-32"
          defaultValue={values.currentPage}
          aria-invalid={fieldErrors.currentPage ? true : undefined}
          aria-describedby={fieldErrors.currentPage ? "currentPage-error" : undefined}
        />
      </FormField>

      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        保存する
      </Button>
    </form>
  );
}
