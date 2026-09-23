import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { RECENT_BOOK_NOTE_FIXTURES } from "@/entities/book-note/fixtures/bookNotes";

import { RecentBookNoteList } from "./RecentBookNoteList";
import { RecentBookNoteListSkeleton } from "./RecentBookNoteListSkeleton";

const meta = {
  component: RecentBookNoteList,
  args: { notes: RECENT_BOOK_NOTE_FIXTURES },
} satisfies Meta<typeof RecentBookNoteList>;

export default meta;

type Story = StoryObj<typeof meta>;

// 1 件目は改行入りの長い本文で、2 行で切れる。本のタイトルはその本のメモ一覧へのリンク。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Clean Architecture" })).toHaveAttribute(
      "href",
      "/books/3/notes",
    );
  },
};

export const Empty: Story = {
  args: { notes: [] },
};

// 付属品の Skeleton。1 件ぶんの高さと余白が本物とずれていないかを見る。
export const Loading: Story = {
  render: () => <RecentBookNoteListSkeleton />,
};
