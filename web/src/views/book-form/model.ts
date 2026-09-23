import { z } from "zod";

import { BOOK_STATUSES, type BookStatus } from "@/entities/book/model";

// フォームの値の型。Presentational はこれだけを知り、API の型 (BookCreate / BookUpdate) は知らない (docs/backend.md §1)。
// 入力欄の値は文字列のまま持つ。検証に落ちたときに入力したままの文字を再表示するため。
export type BookFormValues = {
  title: string;
  author: string;
  totalPages: string;
  status: BookStatus;
};

const TOTAL_PAGES_MESSAGE = "ページ数は 1 以上の整数で入力してください";

// FormData から読んだ文字列を検証するスキーマ。検証は Server Action の中で行う (docs/tech-stack.md §5)。
// status は optional。編集画面では select が disabled で FormData に含まれないため (docs/backend.md §1)。
export const BookFormSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください"),
  author: z.string().trim().min(1, "著者を入力してください"),
  totalPages: z
    .string()
    .trim()
    .regex(/^\d+$/, TOTAL_PAGES_MESSAGE)
    .refine((value) => Number(value) >= 1, TOTAL_PAGES_MESSAGE),
  status: z.enum(BOOK_STATUSES).optional(),
});

// 項目名。スキーマから導く。付属品のコンポーネント BookFormField と紛れないよう Name を付ける
type BookFormFieldName = keyof z.infer<typeof BookFormSchema>;

export type BookFormFieldErrors = Partial<Record<BookFormFieldName, string>>;

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
