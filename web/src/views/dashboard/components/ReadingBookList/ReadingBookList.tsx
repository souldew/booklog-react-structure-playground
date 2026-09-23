import Link from "next/link";

import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { progressPercent } from "@/entities/book-progress/lib/progressPercent";
import { routes } from "@/shared/routes/routes";

import type { ReadingBook } from "../../model";

type Props = {
  items: ReadingBook[];
};

// 読書中の本と読了率。本と進捗の 2 ドメインの値を並べるが、組にしたのは api で、ここは描くだけ。
export function ReadingBookList({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">読書中の本はありません</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {items.map(({ book, progress }) => (
        <li key={book.id} className="space-y-2 p-3 text-sm">
          <Link href={routes.bookDetail(book.id)} className="font-medium hover:underline">
            {book.title}
          </Link>
          {/* progressbar の名前は ProgressLabel が aria-labelledby で付ける (「120 / 420 ページ」) */}
          <Progress value={progressPercent(progress.currentPage, book.totalPages)}>
            <ProgressLabel className="text-xs font-normal text-muted-foreground">
              {progress.currentPage} / {book.totalPages} ページ
            </ProgressLabel>
            <ProgressValue className="text-xs" />
          </Progress>
        </li>
      ))}
    </ul>
  );
}
