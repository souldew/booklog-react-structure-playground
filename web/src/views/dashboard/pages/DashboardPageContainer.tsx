import { fetchDashboard } from "../apis/functions/fetchDashboard";
import { BookReadingStatTable } from "../components/BookReadingStatTable/BookReadingStatTable";
import { ReadingBookList } from "../components/ReadingBookList/ReadingBookList";
import { RecentBookNoteList } from "../components/RecentBookNoteList/RecentBookNoteList";
import { DashboardPage } from "./DashboardPage";

// 1 画面ぶんをまとめて取り、3 つのパネルのスロットに配る。
// 取得が 1 回なので Suspense 境界も画面に 1 つで、位置は app/dashboard/loading.tsx が決める。
// パネルごとに境界を置いても同時に解決するので、置く意味が無い (docs/screens.md §5)。
export async function DashboardPageContainer() {
  const { readingBooks, recentNotes, monthlyStats } = await fetchDashboard();

  return (
    <DashboardPage
      reading={<ReadingBookList items={readingBooks} />}
      notes={<RecentBookNoteList notes={recentNotes} />}
      stats={<BookReadingStatTable stats={monthlyStats} />}
    />
  );
}
