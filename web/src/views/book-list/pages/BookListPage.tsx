import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { BookFilterField } from "../components/BookFilterField/BookFilterField";

type Props = {
  /** 行。Container が Suspense で包んで注入する */
  rows: ReactNode;
};

// 画面の骨格。データに依存しないツールバー・絞り込み欄・テーブルヘッダーは境界の外に出す。
// 絞り込みの入力欄をレイアウトではなくここに置くのは、入力欄と表の繋がりを story で見せるため。
export function BookListPage({ rows }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">本</h1>
        {/* リンクをボタンの見た目にする。Button の render だと role="button" になるので buttonVariants で見た目だけ借りる */}
        <Link href="/books/new" className={buttonVariants()}>
          本を追加
        </Link>
      </div>
      <BookFilterField />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>著者</TableHead>
            <TableHead>状態</TableHead>
            <TableHead className="text-right">ページ数</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        {rows}
      </Table>
    </div>
  );
}
