import { z } from "zod";

import type { FieldErrors } from "@/shared/lib/fieldErrors";

// フォームの値の型。Presentational はこれだけを知り、API の型 (BookNoteCreate / BookNoteUpdate) は知らない。
// 入力欄の値は文字列のまま持つ。検証に落ちたときに入力したままの文字を再表示するため。
// bookId と noteId は URL から来て Server Action に bind されるので、フォームの値には含めない。
export type BookNoteFormValues = {
  page: string;
  body: string;
};

// API の page は nonnegative。「まだ読み始める前のメモ」を 0 ページに付けられる。
const PAGE_MESSAGE = "ページは 0 以上の整数で入力してください";

// FormData から読んだ文字列を検証するスキーマ。検証は Server Action の中で行う (docs/tech-stack.md §5)。
// BookForm と違い disabled な項目が無いので、optional な項目も無い。
export const BookNoteFormSchema = z.object({
  page: z.string().trim().regex(/^\d+$/, PAGE_MESSAGE),
  body: z.string().trim().min(1, "本文を入力してください"),
});

type BookNoteFormFieldName = keyof z.infer<typeof BookNoteFormSchema>;

export type BookNoteFormFieldErrors = FieldErrors<BookNoteFormFieldName>;

// useActionState が持つ状態。Server Action の戻り値でもある。
// 成功時は redirect するので、この型が返るのは検証か通信に失敗したときだけ。
export type BookNoteFormState = {
  values: BookNoteFormValues;
  fieldErrors: BookNoteFormFieldErrors;
  /** 項目に紐づかない失敗 (API のエラーなど) */
  message?: string;
};

export type BookNoteFormAction = (
  state: BookNoteFormState,
  formData: FormData,
) => Promise<BookNoteFormState>;

export const EMPTY_BOOK_NOTE_FORM_VALUES: BookNoteFormValues = {
  page: "",
  body: "",
};
