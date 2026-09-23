import type { ReactNode } from "react";

import { GlobalNav } from "@/shared/components/GlobalNav/GlobalNav";

type Props = {
  children: ReactNode;
};

// アプリ全体の骨格。ヘッダー (グローバルナビ) と、画面を置く <main>。
// html / body、フォント、グローバル CSS は app/layout.tsx が持ち、ここはその内側のマークアップだけを持つ。
// ヘッダーにユーザー情報など取得が要るものを載せるときは、header をスロットで受ける形に変えて widgets から注入する
// (docs/structure-notes.md §4)。
export function AppLayout({ children }: Props) {
  return (
    <>
      <header className="border-b">
        <GlobalNav />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
