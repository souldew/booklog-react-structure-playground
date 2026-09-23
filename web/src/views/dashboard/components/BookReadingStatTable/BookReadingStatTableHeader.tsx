import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

// BookReadingStatTable と BookReadingStatTableSkeleton が共有する列見出し。
// 列名はデータに依存しないので、Skeleton でも本物と同じ文言をそのまま出す。
// 2 つが同じものを使うことで、列の数と寄せがずれない。
export function BookReadingStatTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>月</TableHead>
        <TableHead className="text-right">登録した本</TableHead>
        <TableHead className="text-right">ページ数</TableHead>
        <TableHead className="text-right">メモ</TableHead>
      </TableRow>
    </TableHeader>
  );
}
