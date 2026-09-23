import { BookReadingStatTableSkeleton } from "../components/BookReadingStatTable/BookReadingStatTableSkeleton";
import { ReadingBookListSkeleton } from "../components/ReadingBookList/ReadingBookListSkeleton";
import { RecentBookNoteListSkeleton } from "../components/RecentBookNoteList/RecentBookNoteListSkeleton";
import { DashboardPage } from "./DashboardPage";

// 画面全体の fallback。取得が 1 回なので、3 つのパネルは同時に Skeleton から中身に変わる。
// 枠と見出しは DashboardPage が描くので、待っている間もレイアウトは変わらない。
export function DashboardPageSkeleton() {
  return (
    <DashboardPage
      reading={<ReadingBookListSkeleton />}
      notes={<RecentBookNoteListSkeleton />}
      stats={<BookReadingStatTableSkeleton />}
    />
  );
}
