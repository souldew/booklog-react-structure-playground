import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BOOK_STATUSES } from "../../model";
import { BookStatusBadge } from "./BookStatusBadge";

const meta = {
  component: BookStatusBadge,
  args: { status: "reading" },
} satisfies Meta<typeof BookStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 状態が増えたときに見た目の対応漏れがないかを一覧で見る。
export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      {BOOK_STATUSES.map((status) => (
        <BookStatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};
