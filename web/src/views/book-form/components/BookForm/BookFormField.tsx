import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  error?: string;
  /** 入力欄の下に出す補足。error があるときは出さない */
  hint?: string;
  children: ReactNode;
};

// BookForm の付属品。ラベルとエラー表示の枠で、状態は持たない。BookForm 以外から import しない。
export function BookFormField({ id, label, error, hint, children }: Props) {
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
