import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";
import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { BookInfo } from "../components/BookInfo/BookInfo";
import { BookInfoSkeleton } from "../components/BookInfoSkeleton/BookInfoSkeleton";
import { BookNoteList } from "../components/BookNoteList/BookNoteList";
import { BookNoteListSkeleton } from "../components/BookNoteListSkeleton/BookNoteListSkeleton";
import { BookDetailPage } from "./BookDetailPage";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
const meta = {
  component: BookDetailPage,
  args: {
    bookId: BOOK_FIXTURES.reading.id,
    info: <BookInfo book={BOOK_FIXTURES.reading} />,
    notes: <BookNoteList notes={BOOK_NOTE_FIXTURES} />,
  },
} satisfies Meta<typeof BookDetailPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
