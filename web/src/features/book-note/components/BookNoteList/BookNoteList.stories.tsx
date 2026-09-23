import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BOOK_NOTE_FIXTURES } from "../../fixtures/bookNotes";
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

// メモ一覧の画面で使う姿。編集リンクは各メモの bookId と id から組む。
export const WithEditLink: Story = {
  args: { showEditLink: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link", { name: "編集" });
    await expect(links).toHaveLength(BOOK_NOTE_FIXTURES.length);
    await expect(links[0]).toHaveAttribute("href", "/books/2/notes/1/edit");
  },
};
