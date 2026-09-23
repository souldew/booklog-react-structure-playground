import type { RecentBookNote } from "@/entities/book-note/model";
import type { BookProgress } from "@/entities/book-progress/model";
import type { BookReadingStat } from "@/entities/book-reading-stat/model";
import type { Book } from "@/entities/book/model";

// 読書中の本と、その進捗の組。本 (entities/book) と進捗 (entities/book-progress) は互いを知らないので、
// 2 つを組み合わせた型はそれを並べる画面 (この view) が持つ。
export type ReadingBook = {
  book: Book;
  progress: BookProgress;
};

// ダッシュボード 1 画面ぶんのデータ。パネルの数だけフィールドを持つ。
// 画面に紐づく型なので entities には置けず、この view が持つ。
export type Dashboard = {
  readingBooks: ReadingBook[];
  recentNotes: RecentBookNote[];
  monthlyStats: BookReadingStat[];
};
