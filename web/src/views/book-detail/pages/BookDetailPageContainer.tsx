import { Suspense } from "react";

import { BookInfoContainer } from "../components/BookInfo/BookInfoContainer";
import { BookInfoSkeleton } from "../components/BookInfoSkeleton/BookInfoSkeleton";
import { BookNoteListContainer } from "../components/BookNoteList/BookNoteListContainer";
import { BookNoteListSkeleton } from "../components/BookNoteListSkeleton/BookNoteListSkeleton";
import { BookDetailPage } from "./BookDetailPage";

type Props = {
  bookId: string;
};

// 書誌情報 (400ms) とメモ一覧 (200ms) を別々の境界に置く。api の遅延が違うので、出る順番が入れ替わるのが見える。
export function BookDetailPageContainer({ bookId }: Props) {
  return (
    <BookDetailPage
      bookId={bookId}
      info={
        <Suspense fallback={<BookInfoSkeleton />}>
          <BookInfoContainer bookId={bookId} />
        </Suspense>
      }
      notes={
        <Suspense fallback={<BookNoteListSkeleton />}>
          <BookNoteListContainer bookId={bookId} />
        </Suspense>
      }
    />
  );
}
