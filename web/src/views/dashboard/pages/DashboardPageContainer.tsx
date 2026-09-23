import { Suspense } from "react";

import { BookReadingStatTableContainer } from "../components/BookReadingStatTable/BookReadingStatTableContainer";
import { BookReadingStatTableSkeleton } from "../components/BookReadingStatTable/BookReadingStatTableSkeleton";
import { ReadingBookListContainer } from "../components/ReadingBookList/ReadingBookListContainer";
import { ReadingBookListSkeleton } from "../components/ReadingBookList/ReadingBookListSkeleton";
import { RecentBookNoteListContainer } from "../components/RecentBookNoteList/RecentBookNoteListContainer";
import { RecentBookNoteListSkeleton } from "../components/RecentBookNoteList/RecentBookNoteListSkeleton";
import { DashboardPage } from "./DashboardPage";

// 取得はしない。Suspense 境界の位置を決めて、取得する Container をスロットに注入する。
// 境界はパネルごとに置くので、遅いパネルが速いパネルを待たせない。
// api の遅延は統計 300ms、本 1200ms + 進捗 200ms、メモ 1500ms なので、統計 → 本 → メモの順に出る。
// 集約エンドポイント (GET /dashboard) を作らないのは、1 回の待ちにまとまって境界を分ける意味が消えるため (docs/backend.md §4)。
export function DashboardPageContainer() {
  return (
    <DashboardPage
      reading={
        <Suspense fallback={<ReadingBookListSkeleton />}>
          <ReadingBookListContainer />
        </Suspense>
      }
      notes={
        <Suspense fallback={<RecentBookNoteListSkeleton />}>
          <RecentBookNoteListContainer />
        </Suspense>
      }
      stats={
        <Suspense fallback={<BookReadingStatTableSkeleton />}>
          <BookReadingStatTableContainer />
        </Suspense>
      }
    />
  );
}
