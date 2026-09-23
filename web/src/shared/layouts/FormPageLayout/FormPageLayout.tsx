import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 戻り先。作成は一覧、編集は詳細、など */
  backHref: string;
  backLabel: string;
  /** フォーム本体。取得するものがある画面では Container が Suspense で包んで注入する */
  children: ReactNode;
};

// フォーム画面 (XxxFormPage) が共有する骨格。戻るリンクと見出しはデータに依存しないので、Suspense 境界の外に出る。
// URL を知っているのは呼ぶ側の Page で、この部品は受け取った href を描くだけ。
export function FormPageLayout({ title, backHref, backLabel, children }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
          ← {backLabel}
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {children}
    </div>
  );
}
