import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatMonth } from "@/entities/book-reading-stat/lib/formatMonth";
import type { BookReadingStat } from "@/entities/book-reading-stat/model";

import { BookReadingStatTableHeader } from "./BookReadingStatTableHeader";

type Props = {
  stats: BookReadingStat[];
};

// 月別の記録。並びは受け取ったまま (api が新しい月を先に返す)。
export function BookReadingStatTable({ stats }: Props) {
  return (
    <Table>
      <BookReadingStatTableHeader />
      <TableBody>
        {stats.map((stat) => (
          <TableRow key={stat.month}>
            <TableCell>{formatMonth(stat.month)}</TableCell>
            <TableCell className="text-right tabular-nums">{stat.booksAdded}</TableCell>
            <TableCell className="text-right tabular-nums">{stat.pagesAdded}</TableCell>
            <TableCell className="text-right tabular-nums">{stat.notesWritten}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
