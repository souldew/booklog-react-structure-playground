import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Table, TableBody } from "@/components/ui/table";
import { BOOK_FIXTURES } from "@/entities/book/fixtures/books";
import type { ActionResult } from "@/shared/apis/actionResult";

import { BookRow } from "./BookRow";

// <tr> なので Table と TableBody で包む。更新の実装は props で受け取るだけなので fn() で差し替える。
const meta = {
  component: BookRow,
  args: {
    book: BOOK_FIXTURES.reading,
    onChangeStatus: fn(async (): Promise<ActionResult> => ({ ok: true })),
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
} satisfies Meta<typeof BookRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Reading: Story = {};

export const Finished: Story = {
  args: { book: BOOK_FIXTURES.finished },
};

// 失敗は throw ではなく値で返り、行の中に表示される (docs/backend.md §1)。
export const UpdateFails: Story = {
  args: {
    onChangeStatus: fn(async (): Promise<ActionResult> => ({
      ok: false,
      message: "network error",
    })),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "読了にする" }));
    await expect(args.onChangeStatus).toHaveBeenCalledWith("2", "finished");
    await expect(canvas.getByRole("alert")).toHaveTextContent("network error");
  },
};
