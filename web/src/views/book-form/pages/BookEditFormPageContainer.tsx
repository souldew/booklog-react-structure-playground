import { Suspense } from "react";

import { BookFormContainer } from "../components/BookForm/BookFormContainer";
import { BookFormSkeleton } from "../components/BookFormSkeleton/BookFormSkeleton";
import { BookFormPage } from "./BookFormPage";

type Props = {
  bookId: string;
};

// 編集。フォームの枠は境界の外、フィールドだけ境界の内 (docs/screens.md §5)。
export function BookEditFormPageContainer({ bookId }: Props) {
  return (
    <BookFormPage
      title="本を編集"
      backHref={`/books/${bookId}`}
      backLabel="詳細へ"
      form={
        <Suspense fallback={<BookFormSkeleton />}>
          <BookFormContainer bookId={bookId} />
        </Suspense>
      }
    />
  );
}
