import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BOOK_READING_STAT_FIXTURES } from "@/entities/book-reading-stat/fixtures/bookReadingStats";

import { BookReadingStatTable } from "./BookReadingStatTable";
import { BookReadingStatTableSkeleton } from "./BookReadingStatTableSkeleton";

const meta = {
  component: BookReadingStatTable,
  args: { stats: BOOK_READING_STAT_FIXTURES },
} satisfies Meta<typeof BookReadingStatTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// 6 か月ぶん。データの無い月 (2026年5月) も 0 の行として出る。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("row")).toHaveLength(BOOK_READING_STAT_FIXTURES.length + 1);
    await expect(canvas.getByRole("cell", { name: "2026年5月" })).toBeVisible();
  },
};

// 付属品の Skeleton。列の構成が本物とずれていないかを見る。
export const Loading: Story = {
  render: () => <BookReadingStatTableSkeleton />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("columnheader", { name: "ページ数" })).toBeVisible();
  },
};
