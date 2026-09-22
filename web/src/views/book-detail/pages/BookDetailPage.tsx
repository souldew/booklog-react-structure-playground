import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";

type Props = {
  bookId: string;
  /** 書誌情報。Container が Suspense で包んで注入する */
  info: ReactNode;
  /** ネストしたメモ一覧。info とは別の Suspense 境界 */
  notes: ReactNode;
};

// 見出しとリンクはデータに依存しないので境界の外。書誌情報とメモ一覧は別々の境界で、速いほうから出る。
export function BookDetailPage({ bookId, info, notes }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/books" className="text-sm text-muted-foreground hover:underline">
            ← 一覧へ
          </Link>
          <h1 className="text-xl font-semibold">本の詳細</h1>
        </div>
        {/* リンクをボタンの見た目にする。Button の render に Link を渡すと role="button" が付いてリンクの意味が消えるので、
            buttonVariants で見た目だけ借りて素の Link を描く */}
        <div className="flex gap-2">
          <Link
            href={`/books/${bookId}/progress`}
            className={buttonVariants({ variant: "outline" })}
          >
            進捗を更新
          </Link>
          <Link href={`/books/${bookId}/edit`} className={buttonVariants()}>
            編集
          </Link>
        </div>
      </div>

      <section>{info}</section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">メモ</h2>
          <Link
            href={`/books/${bookId}/notes`}
            className="text-sm text-muted-foreground hover:underline"
          >
            メモをすべて見る
          </Link>
        </div>
        {notes}
      </section>
    </div>
  );
}
