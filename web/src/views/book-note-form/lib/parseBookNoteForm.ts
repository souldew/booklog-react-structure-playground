import { firstFieldErrors } from "@/shared/lib/fieldErrors";

import {
  type BookNoteFormFieldErrors,
  BookNoteFormSchema,
  type BookNoteFormValues,
} from "../model";

export type ParsedBookNoteForm = {
  /** 再表示用の値。前後の空白だけ落としてある */
  values: BookNoteFormValues;
  fieldErrors: BookNoteFormFieldErrors;
};

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

// FormData を BookNoteFormSchema で検証してフォームの値にする。API の型には触らない (それは apis/mappers の仕事)。
// BookForm の parseBookForm と違い、disabled な項目が無いので previous を引き継ぐ処理も無い。
export function parseBookNoteForm(formData: FormData): ParsedBookNoteForm {
  const raw = {
    page: text(formData, "page"),
    body: text(formData, "body"),
  };

  const result = BookNoteFormSchema.safeParse(raw);
  if (result.success) {
    return { values: result.data, fieldErrors: {} };
  }

  return {
    values: { page: raw.page.trim(), body: raw.body.trim() },
    fieldErrors: firstFieldErrors(BookNoteFormSchema, result.error),
  };
}
