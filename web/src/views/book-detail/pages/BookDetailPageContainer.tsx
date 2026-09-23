import { Suspense } from "react";

import { BookNoteListContainer } from "@/features/book-note/components/BookNoteList/BookNoteListContainer";
import { BookNoteListSkeleton } from "@/features/book-note/components/BookNoteListSkeleton/BookNoteListSkeleton";

import { BookInfoContainer } from "../components/BookInfo/BookInfoContainer";
import { BookInfoSkeleton } from "../components/BookInfoSkeleton/BookInfoSkeleton";
import { BookDetailPage } from "./BookDetailPage";

type Props = {
  bookId: string;
};

// 書誌情報 (400ms) とメモ一覧 (200ms) を別々の境界に置く。api の遅延が違うので、出る順番が入れ替わるのが見える。
// メモ一覧の部品は features/book-note のもの。詳細では編集リンクを出さないので showEditLink を渡さない。
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
