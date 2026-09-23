import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BookNoteList } from "@/features/book-note/components/BookNoteList/BookNoteList";
import { BookNoteListSkeleton } from "@/features/book-note/components/BookNoteListSkeleton/BookNoteListSkeleton";
import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";

import { BookNoteListPage } from "./BookNoteListPage";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
const meta = {
  component: BookNoteListPage,
  args: {
    bookId: "2",
    notes: <BookNoteList notes={BOOK_NOTE_FIXTURES} showEditLink />,
  },
  parameters: {
    slots: { notes: <BookNoteListSkeleton /> },
  },
} satisfies Meta<typeof BookNoteListPage>;

export default meta;

type Story = StoryObj<typeof meta>;

// 追加はコレクションの new、編集はメンバーの edit。URL に noteId が付くのは編集だけ。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "メモを追加" })).toHaveAttribute(
      "href",
      "/books/2/notes/new",
    );
    await expect(canvas.getAllByRole("link", { name: "編集" })[1]).toHaveAttribute(
      "href",
      "/books/2/notes/2/edit",
    );
  },
};

export const Loading: Story = {
  args: { notes: <BookNoteListSkeleton /> },
};

export const Empty: Story = {
  args: { notes: <BookNoteList notes={[]} /> },
};
