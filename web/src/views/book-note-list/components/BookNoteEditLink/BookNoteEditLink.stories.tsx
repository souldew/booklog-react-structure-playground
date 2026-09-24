import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BookNoteEditLink } from "./BookNoteEditLink";

const meta = {
  component: BookNoteEditLink,
  args: { note: { bookId: "2", id: "1" } },
} satisfies Meta<typeof BookNoteEditLink>;

export default meta;

type Story = StoryObj<typeof meta>;

// リンク先はメモの bookId と id から組む。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "編集" })).toHaveAttribute(
      "href",
      "/books/2/notes/1/edit",
    );
  },
};
