import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Table } from "@/components/ui/table";
import { BOOK_FIXTURE_LIST } from "@/entities/book/fixtures/books";
import { BookFilterProvider } from "@/features/book-filter/providers/BookFilterProvider";
import type { ActionResult } from "@/shared/apis/actionResult";

import { BookRows } from "./BookRows";

// <tbody> なので Table で包む。絞り込み条件は Provider から読むので、それも decorator で包む。
// 絞り込みの入力欄と組み合わせた姿は BookListPage の story で見る。
const meta = {
  component: BookRows,
  args: {
    books: BOOK_FIXTURE_LIST,
    onChangeStatus: fn(async (): Promise<ActionResult> => ({ ok: true })),
  },
  decorators: [
    (Story) => (
      <BookFilterProvider>
        <Table>
          <Story />
        </Table>
      </BookFilterProvider>
    ),
  ],
} satisfies Meta<typeof BookRows>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { books: [] },
};
