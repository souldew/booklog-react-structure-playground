import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { BOOK_FIXTURE_LIST } from "@/features/book/fixtures/books";
import { BookFilterProvider } from "@/features/book/providers/BookFilterProvider";
import type { ActionResult } from "@/shared/apis/actionResult";

import { BookRows } from "../components/BookRows/BookRows";
import { BookRowsSkeleton } from "../components/BookRowsSkeleton/BookRowsSkeleton";
import { BookListPage } from "./BookListPage";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// 絞り込み欄と行が同じ Provider を読むので、入力に応じて行が絞られる姿がここで見える。
const meta = {
  component: BookListPage,
  args: {
    rows: (
      <BookRows
        books={BOOK_FIXTURE_LIST}
        onChangeStatus={fn(async (): Promise<ActionResult> => ({ ok: true }))}
      />
    ),
  },
  decorators: [
    (Story) => (
      <BookFilterProvider>
        <Story />
      </BookFilterProvider>
    ),
  ],
} satisfies Meta<typeof BookListPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: { rows: <BookRowsSkeleton /> },
};

export const Filtered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "達人プログラマー" })).toBeVisible();

    await userEvent.type(canvas.getByRole("searchbox"), "clean");
    await expect(canvas.getByRole("link", { name: "Clean Architecture" })).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "達人プログラマー" })).not.toBeInTheDocument();

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "状態" }), "finished");
    await expect(canvas.getByText("該当する本がありません")).toBeVisible();
  },
};
