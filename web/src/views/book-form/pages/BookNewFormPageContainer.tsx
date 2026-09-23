import { routes } from "@/shared/routes/routes";

import { createBook } from "../apis/functions/createBook";
import { BookForm } from "../components/BookForm/BookForm";
import { EMPTY_BOOK_FORM_VALUES } from "../model";
import { BookFormPage } from "./BookFormPage";

// 作成。取得するものが無いので Suspense も Container も無く、Presentational を直接置く。
// 編集側 (BookEditFormPageContainer) と並べると、組み立て層にだけ差が出る。
export function BookNewFormPageContainer() {
  return (
    <BookFormPage
      title="本を追加"
      backHref={routes.books()}
      backLabel="一覧へ"
      form={
        <BookForm
          action={createBook}
          defaultValues={EMPTY_BOOK_FORM_VALUES}
          submitLabel="追加する"
        />
      }
    />
  );
}
