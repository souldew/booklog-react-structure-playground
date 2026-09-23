import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BookNoteList } from "@/features/book-note/components/BookNoteList/BookNoteList";
import { BookNoteListSkeleton } from "@/features/book-note/components/BookNoteListSkeleton/BookNoteListSkeleton";
import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";
import { BOOK_FIXTURES } from "@/features/book/fixtures/books";
import { expectStable } from "@/shared/fixtures/expectStable";

import { BookInfo } from "../components/BookInfo/BookInfo";
import { BookInfoSkeleton } from "../components/BookInfoSkeleton/BookInfoSkeleton";
import { BookDetailPage } from "./BookDetailPage";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// Skeleton から中身への切り替わりは、parameters.slots とツールバーの「スロットの遅延」で見る (.storybook/preview.tsx)。
const meta = {
  component: BookDetailPage,
  args: {
    bookId: BOOK_FIXTURES.reading.id,
    info: <BookInfo book={BOOK_FIXTURES.reading} />,
    notes: <BookNoteList notes={BOOK_NOTE_FIXTURES} />,
  },
  parameters: {
    slots: { info: <BookInfoSkeleton />, notes: <BookNoteListSkeleton /> },
  },
} satisfies Meta<typeof BookDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// ボタンの見た目のリンクが、リンクとして読まれること (Button の render だと role="button" になる)。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "編集" })).toHaveAttribute(
      "href",
      "/books/2/edit",
    );
    await expect(canvas.getByRole("link", { name: "進捗を更新" })).toBeVisible();
  },
};

// 両方の境界がまだ解決していない状態。
export const Loading: Story = {
  args: {
    info: <BookInfoSkeleton />,
    notes: <BookNoteListSkeleton />,
  },
};

// メモだけ先に届いた状態。境界が別なので、速いほうから出る (BookDetailPageContainer)。
export const InfoLoading: Story = {
  args: {
    info: <BookInfoSkeleton />,
  },
};

// 書誌情報だけ先に届いた状態。
export const NotesLoading: Story = {
  args: {
    notes: <BookNoteListSkeleton />,
  },
};

// 書誌情報の Skeleton と中身の高さが揃っていて、下にある「メモ」の見出しが動かないことを検査する。
export const NoLayoutShift: Story = {
  globals: { slotDelay: 800 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectStable(canvas.getByRole("heading", { name: "メモ" }), () =>
      canvas.getByText(BOOK_FIXTURES.reading.title),
    );
  },
};
