import type { BookStatus } from "@/features/book/model";

// フォームの値の型。Presentational はこれだけを知り、API の型 (BookCreate / BookUpdate) は知らない (docs/backend.md §1)。
// 入力欄の値は文字列のまま持つ。検証に落ちたときに入力したままの文字を再表示するため。
export type BookFormValues = {
  title: string;
  author: string;
  totalPages: string;
  status: BookStatus;
};

export type BookFormField = "title" | "author" | "totalPages";

export type BookFormFieldErrors = Partial<Record<BookFormField, string>>;

// useActionState が持つ状態。Server Action の戻り値でもある。
// 成功時は redirect するので、この型が返るのは検証か通信に失敗したときだけ。
export type BookFormState = {
  values: BookFormValues;
  fieldErrors: BookFormFieldErrors;
  /** 項目に紐づかない失敗 (API のエラーなど) */
  message?: string;
};

export type BookFormAction = (state: BookFormState, formData: FormData) => Promise<BookFormState>;

export const EMPTY_BOOK_FORM_VALUES: BookFormValues = {
  title: "",
  author: "",
  totalPages: "",
  status: "unread",
};
