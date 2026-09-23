import { firstFieldErrors } from "@/shared/lib/fieldErrors";

import {
  type BookProgressFormFieldErrors,
  type BookProgressFormValues,
  createBookProgressFormSchema,
} from "../model";

export type ParsedBookProgressForm = {
  values: BookProgressFormValues;
  fieldErrors: BookProgressFormFieldErrors;
};

// FormData を検証してフォームの値にする。上限 (totalPages) は Server Action が bind で受け取って渡す。
export function parseBookProgressForm(
  formData: FormData,
  totalPages: number,
): ParsedBookProgressForm {
  const value = formData.get("currentPage");
  const raw = { currentPage: typeof value === "string" ? value : "" };

  const schema = createBookProgressFormSchema(totalPages);
  const result = schema.safeParse(raw);
  if (result.success) {
    return { values: result.data, fieldErrors: {} };
  }

  return {
    values: { currentPage: raw.currentPage.trim() },
    fieldErrors: firstFieldErrors(schema, result.error),
  };
}
