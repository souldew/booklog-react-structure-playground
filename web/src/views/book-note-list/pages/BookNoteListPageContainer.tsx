import { Suspense } from "react";

import { BookNoteListContainer } from "@/entities/book-note/components/BookNoteList/BookNoteListContainer";
import { BookNoteListSkeleton } from "@/entities/book-note/components/BookNoteListSkeleton/BookNoteListSkeleton";

import { BookNoteEditLink } from "../components/BookNoteEditLink/BookNoteEditLink";
import { BookNoteListPage } from "./BookNoteListPage";

type Props = {
  bookId: string;
};

// 取得はしない。Suspense 境界の位置を決めて、entities の Container をスロットに注入する。
// 詳細画面と同じ Container だが、こちらは actions に編集リンクを渡す。
export function BookNoteListPageContainer({ bookId }: Props) {
  return (
    <BookNoteListPage
      bookId={bookId}
      notes={
        <Suspense fallback={<BookNoteListSkeleton />}>
          <BookNoteListContainer
            bookId={bookId}
            actions={(note) => <BookNoteEditLink note={note} />}
          />
        </Suspense>
      }
    />
  );
}
