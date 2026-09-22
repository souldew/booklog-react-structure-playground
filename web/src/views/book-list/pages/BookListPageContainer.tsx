import { Suspense } from "react";

import { BookRowsContainer } from "../components/BookRows/BookRowsContainer";
import { BookRowsSkeleton } from "../components/BookRowsSkeleton/BookRowsSkeleton";
import { BookListPage } from "./BookListPage";

// 取得はしない。Suspense 境界の位置を決めて、取得する Container をスロットに注入する。
export function BookListPageContainer() {
  return (
    <BookListPage
      rows={
        <Suspense fallback={<BookRowsSkeleton />}>
          <BookRowsContainer />
        </Suspense>
      }
    />
  );
}
