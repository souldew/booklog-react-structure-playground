import { Suspense } from "react";

import { BookProgressFormContainer } from "../components/BookProgressForm/BookProgressFormContainer";
import { BookProgressFormSkeleton } from "../components/BookProgressFormSkeleton/BookProgressFormSkeleton";
import { BookProgressFormPage } from "./BookProgressFormPage";

type Props = {
  bookId: string;
};

// 単一リソースなので Container は 1 つだけ。book-form / book-note-form の New と Edit の 2 つと並べると、
// 「作成が無い」ことが pages/ のファイル数の差として出る。常に取得するので Suspense がある。
export function BookProgressFormPageContainer({ bookId }: Props) {
  return (
    <BookProgressFormPage
      bookId={bookId}
      form={
        <Suspense fallback={<BookProgressFormSkeleton />}>
          <BookProgressFormContainer bookId={bookId} />
        </Suspense>
      }
    />
  );
}
