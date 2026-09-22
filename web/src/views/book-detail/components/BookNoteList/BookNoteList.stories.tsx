import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";

import { BookNoteList } from "./BookNoteList";

const meta = {
  component: BookNoteList,
  args: { notes: BOOK_NOTE_FIXTURES },
} satisfies Meta<typeof BookNoteList>;

export default meta;

type Story = StoryObj<typeof meta>;

// 2 件目は改行入り。whitespace-pre-wrap で改行が残ることを見る。
export const Default: Story = {};

export const Empty: Story = {
  args: { notes: [] },
};
