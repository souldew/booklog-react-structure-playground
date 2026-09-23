import { Suspense } from "react";

import { routes } from "@/shared/routes/routes";

import { BookNoteFormContainer } from "../components/BookNoteForm/BookNoteFormContainer";
import { BookNoteFormSkeleton } from "../components/BookNoteFormSkeleton/BookNoteFormSkeleton";
import { BookNoteFormPage } from "./BookNoteFormPage";

type Props = {
  bookId: string;
  noteId: string;
};

// 編集。フォームの枠は境界の外、フィールドだけ境界の内。ネストした編集なので id が 2 つ要る。
export function BookNoteEditFormPageContainer({ bookId, noteId }: Props) {
  return (
    <BookNoteFormPage
      title="メモを編集"
      backHref={routes.bookNotes(bookId)}
      backLabel="メモ一覧へ"
      form={
        <Suspense fallback={<BookNoteFormSkeleton />}>
          <BookNoteFormContainer bookId={bookId} noteId={noteId} />
        </Suspense>
      }
    />
  );
}
