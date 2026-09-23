import { Suspense } from "react";

import { BookNoteListContainer } from "@/features/book-note/components/BookNoteList/BookNoteListContainer";
import { BookNoteListSkeleton } from "@/features/book-note/components/BookNoteListSkeleton/BookNoteListSkeleton";

import { BookNoteListPage } from "./BookNoteListPage";

type Props = {
  bookId: string;
};

// 取得はしない。Suspense 境界の位置を決めて、features の Container をスロットに注入する。
// 詳細画面と同じ Container だが、こちらは編集リンクを出す。
export function BookNoteListPageContainer({ bookId }: Props) {
  return (
    <BookNoteListPage
      bookId={bookId}
      notes={
        <Suspense fallback={<BookNoteListSkeleton />}>
          <BookNoteListContainer bookId={bookId} showEditLink />
        </Suspense>
      }
    />
  );
}
