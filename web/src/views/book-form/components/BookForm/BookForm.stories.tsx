import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { parseBookForm } from "../../lib/parseBookForm";
import { toBookFormValues } from "../../lib/toBookFormValues";
import { EMPTY_BOOK_FORM_VALUES, type BookFormAction } from "../../model";
import { BookForm } from "./BookForm";

// Server Action の代わり。検証だけして返し、通信はしない。
const validateOnly: BookFormAction = async (state, formData) => {
  const { values, fieldErrors } = parseBookForm(formData, state.values);
  return { values, fieldErrors };
};

const meta = {
  component: BookForm,
  args: {
    action: fn(validateOnly),
    defaultValues: EMPTY_BOOK_FORM_VALUES,
    submitLabel: "追加する",
  },
} satisfies Meta<typeof BookForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// 作成。全欄が空で、状態は選べる。
export const New: Story = {};

// 編集。初期値が入り、状態は一覧のトグルで変えるので disabled。
export const Edit: Story = {
  args: {
    defaultValues: toBookFormValues(BOOK_FIXTURES.onHold),
    statusLocked: true,
    submitLabel: "保存する",
  },
  // disabled な select は FormData に含まれない (docs/backend.md §1)。action に届く FormData で確かめる。
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(args.action).toHaveBeenCalled();
    const [, formData] = args.action.mock.calls[0]!;
    await expect(formData.get("title")).toBe("Clean Architecture");
    await expect(formData.get("status")).toBeNull();
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("ページ数"), "0");
    await userEvent.click(canvas.getByRole("button", { name: "追加する" }));

    await expect(canvas.getByText("タイトルを入力してください")).toBeVisible();
    await expect(canvas.getByText("著者を入力してください")).toBeVisible();
    await expect(canvas.getByText("ページ数は 1 以上の整数で入力してください")).toBeVisible();
    await expect(canvas.getByLabelText("タイトル")).toHaveAttribute("aria-invalid", "true");
  },
};

// API に失敗したとき。項目ではなく form 全体のメッセージとして出る。
export const SubmitFails: Story = {
  args: {
    defaultValues: toBookFormValues(BOOK_FIXTURES.reading),
    action: fn<BookFormAction>(async (state) => ({
      values: state.values,
      fieldErrors: {},
      message: "api responded with 500",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "追加する" }));

    await expect(canvas.getByRole("alert")).toHaveTextContent("api responded with 500");
    await expect(canvas.getByLabelText("タイトル")).toHaveValue("達人プログラマー");
  },
};
