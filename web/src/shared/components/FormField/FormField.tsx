import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  /** 入力欄の下に出す補足。error があるときは出さない */
  hint?: string;
  children: ReactNode;
};

// フォームの 1 項目を包む、ラベルとエラー表示の枠。状態は持たず、複数のフォーム (BookForm など) から使う。
// エラーの id は `${id}-error` で、入力欄側は aria-describedby に同じ値を付ける。aria-invalid も入力欄側が付ける。
export function FormField({ id, label, error, hint, children }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
