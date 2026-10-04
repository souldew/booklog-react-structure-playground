import { fetchBookReadingStats } from "@/entities/book-reading-stat/apis/functions/fetchBookReadingStats";

import { BookReadingStatTable } from "./BookReadingStatTable";

// サーバーで取得して Presentational に渡す。取得中は呼ぶ側の Suspense 境界が Skeleton を出す。
export async function BookReadingStatTableContainer() {
  const stats = await fetchBookReadingStats();
  return <BookReadingStatTable stats={stats} />;
}
