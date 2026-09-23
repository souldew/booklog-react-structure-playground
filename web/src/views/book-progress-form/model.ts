import { z } from "zod";

import type { FieldErrors } from "@/shared/lib/fieldErrors";

// フォームの値の型。単一リソースなので項目は 1 つ。bookId は URL から来て Server Action に bind される。
export type BookProgressFormValues = {
  currentPage: string;
};

const CURRENT_PAGE_MESSAGE = "現在のページは 0 以上の整数で入力してください";

// 「現在のページは本のページ数を超えない」は業務ルールなので model に置く。
// 上限が本ごとに違うので、スキーマは totalPages を受け取って作る。
export function createBookProgressFormSchema(totalPages: number) {
  return z.object({
    currentPage: z
      .string()
      .trim()
      .regex(/^\d+$/, CURRENT_PAGE_MESSAGE)
      .refine(
        (value) => Number(value) <= totalPages,
        `現在のページはページ数 (${totalPages}) 以下で入力してください`,
      ),
  });
}

type BookProgressFormFieldName = keyof z.infer<ReturnType<typeof createBookProgressFormSchema>>;

export type BookProgressFormFieldErrors = FieldErrors<BookProgressFormFieldName>;

// useActionState が持つ状態。成功時は redirect するので、この型が返るのは検証か通信に失敗したときだけ。
export type BookProgressFormState = {
  values: BookProgressFormValues;
  fieldErrors: BookProgressFormFieldErrors;
  /** 項目に紐づかない失敗 (API のエラーなど) */
  message?: string;
};

export type BookProgressFormAction = (
  state: BookProgressFormState,
  formData: FormData,
) => Promise<BookProgressFormState>;
