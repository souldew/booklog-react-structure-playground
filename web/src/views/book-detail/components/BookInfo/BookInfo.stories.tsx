import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { BookInfo } from "./BookInfo";

const meta = {
  component: BookInfo,
  args: { book: BOOK_FIXTURES.reading },
} satisfies Meta<typeof BookInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Finished: Story = {
  args: { book: BOOK_FIXTURES.finished },
};
