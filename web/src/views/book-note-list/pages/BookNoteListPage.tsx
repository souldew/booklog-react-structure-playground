import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/shared/routes/routes";

type Props = {
  bookId: string;
  /** メモの一覧。Container が Suspense で包んで注入する */
  notes: ReactNode;
};

// ネストしたコレクションの一覧画面。見出しと追加リンクはデータに依存しないので境界の外。
// 一覧の部品そのものは entities/book-note のものなので、この view は pages/ しか持たない。
export function BookNoteListPage({ bookId, notes }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href={routes.bookDetail(bookId)}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← 詳細へ
          </Link>
          <h1 className="text-xl font-semibold">メモ</h1>
        </div>
        <Link href={routes.bookNoteNew(bookId)} className={buttonVariants()}>
          メモを追加
        </Link>
      </div>
      {notes}
    </div>
  );
}
