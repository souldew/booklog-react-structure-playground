import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";

import { parseBookNoteForm } from "../../lib/parseBookNoteForm";
import { toBookNoteFormValues } from "../../lib/toBookNoteFormValues";
import { EMPTY_BOOK_NOTE_FORM_VALUES, type BookNoteFormAction } from "../../model";
import { BookNoteForm } from "./BookNoteForm";

// Server Action の代わり。検証だけして返し、通信はしない。
const validateOnly: BookNoteFormAction = async (_state, formData) => parseBookNoteForm(formData);

const meta = {
  component: BookNoteForm,
  args: {
    action: fn(validateOnly),
    defaultValues: EMPTY_BOOK_NOTE_FORM_VALUES,
    submitLabel: "追加する",
  },
} satisfies Meta<typeof BookNoteForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// 作成。全欄が空。
export const New: Story = {};

// 編集。初期値が入る。改行入りの本文が textarea にそのまま載る。
export const Edit: Story = {
  args: {
    defaultValues: toBookNoteFormValues(BOOK_NOTE_FIXTURES[1]!),
    submitLabel: "保存する",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("本文")).toHaveValue(BOOK_NOTE_FIXTURES[1]!.body);
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(args.action).toHaveBeenCalled();
    const [, formData] = args.action.mock.calls[0]!;
    await expect(formData.get("page")).toBe("48");
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("ページ"), "-1");
    await userEvent.click(canvas.getByRole("button", { name: "追加する" }));

    await expect(canvas.getByText("ページは 0 以上の整数で入力してください")).toBeVisible();
    await expect(canvas.getByText("本文を入力してください")).toBeVisible();
    await expect(canvas.getByLabelText("本文")).toHaveAttribute("aria-invalid", "true");
  },
};

// API に失敗したとき。項目ではなく form 全体のメッセージとして出て、入力値は残る。
export const SubmitFails: Story = {
  args: {
    defaultValues: toBookNoteFormValues(BOOK_NOTE_FIXTURES[0]!),
    action: fn<BookNoteFormAction>(async (state) => ({
      values: state.values,
      fieldErrors: {},
      message: "本が見つかりません。削除された可能性があります",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "追加する" }));

    await expect(canvas.getByRole("alert")).toHaveTextContent("本が見つかりません");
    await expect(canvas.getByLabelText("ページ")).toHaveValue(12);
  },
};
