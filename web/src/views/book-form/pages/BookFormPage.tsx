import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 戻り先。作成は一覧、編集は詳細 */
  backHref: string;
  backLabel: string;
  /** フォーム本体。編集では Container が Suspense で包んで注入する。作成ではそのまま置く */
  form: ReactNode;
};

// 作成と編集で共有する骨格。見出しと戻るリンクはデータに依存しないので境界の外。
// 差は Container 側に出る。作成側には Container も Suspense も無い (docs/screens.md §5)。
export function BookFormPage({ title, backHref, backLabel, form }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
          ← {backLabel}
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {form}
    </div>
  );
}
