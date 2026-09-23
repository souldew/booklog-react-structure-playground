import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { BookReadingStatTableHeader } from "./BookReadingStatTableHeader";

const ROW_COUNT = 6;

// BookReadingStatTable と同じ列構成。ヘッダーは共有し、行だけ Skeleton にする。
export function BookReadingStatTableSkeleton() {
  return (
    <Table>
      <BookReadingStatTableHeader />
      <TableBody>
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto h-4 w-6" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto h-4 w-10" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto h-4 w-6" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
