"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/shared/components/FormField/FormField";

import type { BookNoteFormAction, BookNoteFormValues } from "../../model";

type Props = {
  /** Server Action。bookId (と noteId) は bind 済み。story では fn() で差し替える */
  action: BookNoteFormAction;
  defaultValues: BookNoteFormValues;
  submitLabel: string;
};

// 作成と編集で共有する Presentational。差は defaultValues と submitLabel、渡される action だけ。
// どの本のメモか、新規か編集かは知らない。bookId / noteId は action に bind されていて、フォームには現れない。
export function BookNoteForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, {
    values: defaultValues,
    fieldErrors: {},
  });
  const { values, fieldErrors, message } = state;

  return (
    <form action={formAction} noValidate className="max-w-md space-y-4">
      <FormField id="page" label="ページ" error={fieldErrors.page}>
        <Input
          id="page"
          name="page"
          type="number"
          inputMode="numeric"
          min={0}
          className="max-w-32"
          defaultValue={values.page}
          aria-invalid={fieldErrors.page ? true : undefined}
          aria-describedby={fieldErrors.page ? "page-error" : undefined}
        />
      </FormField>

      <FormField id="body" label="本文" error={fieldErrors.body}>
        <Textarea
          id="body"
          name="body"
          className="min-h-36"
          defaultValue={values.body}
          aria-invalid={fieldErrors.body ? true : undefined}
          aria-describedby={fieldErrors.body ? "body-error" : undefined}
        />
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
