import type { BookStatus } from "@/entities/book/model";
import { firstFieldErrors } from "@/shared/lib/fieldErrors";

import { type BookFormFieldErrors, BookFormSchema, type BookFormValues } from "../model";

export type ParsedBookForm = {
  /** 再表示用の値。status が送られてこなければ previous のものを引き継ぐ */
  values: BookFormValues;
  /** 実際に送信された status。select が disabled だと FormData に含まれず undefined になる */
  submittedStatus: BookStatus | undefined;
  fieldErrors: BookFormFieldErrors;
};

function text(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

// FormData を BookFormSchema で検証してフォームの値にする。API の型には触らない (それは apis/mappers の仕事)。
//
// disabled な input は送信されない (docs/backend.md §1)。編集画面では status の select を disabled にしているので、
// FormData に status が無いのは正常であり、スキーマ側も optional にしてある。
// これを見落として status を必須にすると、編集の保存が必ず失敗する。
export function parseBookForm(formData: FormData, previous: BookFormValues): ParsedBookForm {
  const raw = {
    title: text(formData, "title") ?? "",
    author: text(formData, "author") ?? "",
    totalPages: text(formData, "totalPages") ?? "",
    status: text(formData, "status"),
  };

  const result = BookFormSchema.safeParse(raw);

  if (result.success) {
    const { status, ...rest } = result.data;
    return {
      values: { ...rest, status: status ?? previous.status },
      submittedStatus: status,
      fieldErrors: {},
    };
  }

  // 項目ごとに最初のメッセージだけを出す。値は入力したまま (前後の空白だけ落として) 返す。
  return {
    values: {
      title: raw.title.trim(),
      author: raw.author.trim(),
      totalPages: raw.totalPages.trim(),
      status: previous.status,
    },
    submittedStatus: undefined,
    fieldErrors: firstFieldErrors(BookFormSchema, result.error),
  };
}
