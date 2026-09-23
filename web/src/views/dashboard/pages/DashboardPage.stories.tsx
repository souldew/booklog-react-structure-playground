import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { RECENT_BOOK_NOTE_FIXTURES } from "@/entities/book-note/fixtures/bookNotes";
import { BOOK_READING_STAT_FIXTURES } from "@/entities/book-reading-stat/fixtures/bookReadingStats";

import { BookReadingStatTable } from "../components/BookReadingStatTable/BookReadingStatTable";
import { BookReadingStatTableSkeleton } from "../components/BookReadingStatTable/BookReadingStatTableSkeleton";
import { ReadingBookList } from "../components/ReadingBookList/ReadingBookList";
import { ReadingBookListSkeleton } from "../components/ReadingBookList/ReadingBookListSkeleton";
import { RecentBookNoteList } from "../components/RecentBookNoteList/RecentBookNoteList";
import { RecentBookNoteListSkeleton } from "../components/RecentBookNoteList/RecentBookNoteListSkeleton";
import { READING_BOOK_FIXTURES } from "../fixtures/readingBooks";
import { DashboardPage } from "./DashboardPage";
import { DashboardPageSkeleton } from "./DashboardPageSkeleton";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// Skeleton から中身への切り替わりは、parameters.slots とツールバーの「スロットの遅延」で見る。
// 取得は 1 回なので 3 つのパネルは同時に切り替わる。
const meta = {
  component: DashboardPage,
  args: {
    reading: <ReadingBookList items={READING_BOOK_FIXTURES} />,
    notes: <RecentBookNoteList notes={RECENT_BOOK_NOTE_FIXTURES} />,
    stats: <BookReadingStatTable stats={BOOK_READING_STAT_FIXTURES} />,
  },
  parameters: {
    layout: "fullscreen",
    slots: {
      reading: <ReadingBookListSkeleton />,
      notes: <RecentBookNoteListSkeleton />,
      stats: <BookReadingStatTableSkeleton />,
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "本の一覧へ" })).toHaveAttribute(
      "href",
      "/books",
    );
    await expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  },
};

// 取得を待っている状態。app/dashboard/loading.tsx が出す fallback そのもの。
// パネル単位の境界が無いので、一部だけ解決した姿は実際には現れない。
export const Loading: Story = {
  render: () => <DashboardPageSkeleton />,
};

// 全部空。登録直後のアプリの姿。
export const Empty: Story = {
  args: {
    reading: <ReadingBookList items={[]} />,
    notes: <RecentBookNoteList notes={[]} />,
    stats: (
      <BookReadingStatTable
        stats={BOOK_READING_STAT_FIXTURES.map((stat) => ({
          ...stat,
          booksAdded: 0,
          pagesAdded: 0,
          notesWritten: 0,
        }))}
      />
    ),
  },
};
