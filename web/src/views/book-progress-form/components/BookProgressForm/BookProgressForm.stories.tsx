import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { BOOK_PROGRESS_FIXTURE } from "@/features/book-progress/fixtures/bookProgress";
import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { parseBookProgressForm } from "../../lib/parseBookProgressForm";
import { toBookProgressFormValues } from "../../lib/toBookProgressFormValues";
import type { BookProgressFormAction } from "../../model";
import { BookProgressForm } from "./BookProgressForm";

const book = BOOK_FIXTURES.reading;

// Server Action の代わり。上限を bind した状態を再現し、検証だけして返す。
const validateOnly: BookProgressFormAction = async (_state, formData) =>
  parseBookProgressForm(formData, book.totalPages);

const meta = {
  component: BookProgressForm,
  args: {
    action: fn(validateOnly),
    defaultValues: toBookProgressFormValues(BOOK_PROGRESS_FIXTURE),
    totalPages: book.totalPages,
    updatedAt: BOOK_PROGRESS_FIXTURE.updatedAt,
  },
} satisfies Meta<typeof BookProgressForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// 単一リソースなので New に相当する story は無い。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("現在のページ")).toHaveValue(120);
    await expect(canvas.getByText(/全 420 ページ/)).toBeVisible();
  },
};

// 上限は本のページ数。noValidate なので max では止まらず、Server Action 側のメッセージが出る。
export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("現在のページ");
    await userEvent.clear(input);
    await userEvent.type(input, "500");
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(
      canvas.getByText("現在のページはページ数 (420) 以下で入力してください"),
    ).toBeVisible();
    await expect(canvas.getByLabelText("現在のページ")).toHaveValue(500);
  },
};

export const SubmitFails: Story = {
  args: {
    action: fn<BookProgressFormAction>(async (state) => ({
      values: state.values,
      fieldErrors: {},
      message: "api responded with 500",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByRole("alert")).toHaveTextContent("api responded with 500");
  },
};
