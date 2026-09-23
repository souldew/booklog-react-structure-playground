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

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// 3 つのパネルが別々に解決する様子は、parameters.slots とツールバーの「スロットの遅延」で見る。
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

// 3 つとも解決していない状態。
export const Loading: Story = {
  args: {
    reading: <ReadingBookListSkeleton />,
    notes: <RecentBookNoteListSkeleton />,
    stats: <BookReadingStatTableSkeleton />,
  },
};

// 統計 (300ms) だけ先に届いた状態。実際の api の遅延だとまずこの姿になる。
export const StatsOnly: Story = {
  args: {
    reading: <ReadingBookListSkeleton />,
    notes: <RecentBookNoteListSkeleton />,
  },
};

// メモ (1500ms) だけがまだの状態。
export const NotesLoading: Story = {
  args: {
    notes: <RecentBookNoteListSkeleton />,
  },
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
