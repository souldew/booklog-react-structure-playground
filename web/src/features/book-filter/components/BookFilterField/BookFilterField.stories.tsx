import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { BookFilterProvider } from "../../providers/BookFilterProvider";
import { BookFilterField } from "./BookFilterField";

// 条件は Provider が持つので decorator で包む。初期値は EMPTY_BOOK_FILTER。
const meta = {
  component: BookFilterField,
  decorators: [
    (Story) => (
      <BookFilterProvider>
        <Story />
      </BookFilterProvider>
    ),
  ],
} satisfies Meta<typeof BookFilterField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "状態" }), "reading");
    await userEvent.type(canvas.getByRole("searchbox"), "達人");
    await expect(canvas.getByRole("combobox", { name: "状態" })).toHaveValue("reading");
    await expect(canvas.getByRole("searchbox")).toHaveValue("達人");
  },
};
