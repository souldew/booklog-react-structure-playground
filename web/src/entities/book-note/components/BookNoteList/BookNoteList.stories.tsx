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

// actions は 1 件ごとに呼ばれ、そのメモを受け取る。中身は使う側の view が決めるので、ここでは仮の要素を出す。
export const WithActions: Story = {
  args: {
    actions: (note) => <button type="button">{`操作 ${note.id}`}</button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button", { name: /^操作/ });
    await expect(buttons).toHaveLength(BOOK_NOTE_FIXTURES.length);
    await expect(buttons[0]).toHaveTextContent(`操作 ${BOOK_NOTE_FIXTURES[0].id}`);
  },
};
