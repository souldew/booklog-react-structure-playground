import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { READING_BOOK_FIXTURES } from "../../fixtures/readingBooks";
import { ReadingBookList } from "./ReadingBookList";
import { ReadingBookListSkeleton } from "./ReadingBookListSkeleton";

const meta = {
  component: ReadingBookList,
  args: { items: READING_BOOK_FIXTURES },
} satisfies Meta<typeof ReadingBookList>;

export default meta;

type Story = StoryObj<typeof meta>;

// 120 / 420 ページ → 29%。タイトルは詳細へのリンク。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "達人プログラマー" })).toHaveAttribute(
      "href",
      "/books/2",
    );
    await expect(canvas.getByRole("progressbar", { name: "120 / 420 ページ" })).toHaveAttribute(
      "aria-valuenow",
      "29",
    );
  },
};

export const Empty: Story = {
  args: { items: [] },
};

// 付属品の Skeleton。1 件ぶんの高さと余白が本物とずれていないかを見る。
export const Loading: Story = {
  render: () => <ReadingBookListSkeleton />,
};
