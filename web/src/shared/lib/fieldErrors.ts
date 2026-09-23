import { z } from "zod";

/** 項目名 → 最初のメッセージ。メッセージの無い項目はキーごと作らない */
export type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

// zod のエラーを「1 項目 1 メッセージ」に潰す。フォームの Server Action が検証に落ちたときに使う。
// 項目の一覧はスキーマから取る (keyof)。Object.keys だとキーの型が string に落ちる。
// フォームライブラリ (Conform) を入れる場合は submission.reply() が担う部分 (docs/tech-stack.md §5)。
export function firstFieldErrors<TSchema extends z.ZodObject>(
  schema: TSchema,
  error: z.ZodError<z.infer<TSchema>>,
): FieldErrors<keyof z.infer<TSchema> & string> {
  type Field = keyof z.infer<TSchema> & string;

  const flattened = z.flattenError(error).fieldErrors as Partial<Record<Field, string[]>>;
  const fieldErrors: FieldErrors<Field> = {};
  for (const field of schema.keyof().options as Field[]) {
    const message = flattened[field]?.[0];
    if (message) fieldErrors[field] = message;
  }
  return fieldErrors;
}

// キーの数で判定する。firstFieldErrors がメッセージの無い項目を作らないことが前提。
export function hasFieldErrors(fieldErrors: FieldErrors<string>): boolean {
  return Object.keys(fieldErrors).length > 0;
}
