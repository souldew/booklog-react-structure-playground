import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { BOOK_NOTE_FIXTURES } from "@/features/book-note/fixtures/bookNotes";

import { BookNoteForm } from "../components/BookNoteForm/BookNoteForm";
import { BookNoteFormSkeleton } from "../components/BookNoteFormSkeleton/BookNoteFormSkeleton";
import { parseBookNoteForm } from "../lib/parseBookNoteForm";
import { toBookNoteFormValues } from "../lib/toBookNoteFormValues";
import { EMPTY_BOOK_NOTE_FORM_VALUES, type BookNoteFormAction } from "../model";
import { BookNoteFormPage } from "./BookNoteFormPage";

const validateOnly: BookNoteFormAction = async (_state, formData) => parseBookNoteForm(formData);

const note = BOOK_NOTE_FIXTURES[1]!;

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
const meta = {
  component: BookNoteFormPage,
  args: {
    title: "メモを追加",
    backHref: `/books/${note.bookId}/notes`,
    backLabel: "メモ一覧へ",
    form: (
      <BookNoteForm
        action={fn(validateOnly)}
        defaultValues={EMPTY_BOOK_NOTE_FORM_VALUES}
        submitLabel="追加する"
      />
    ),
  },
  parameters: {
    slots: { form: <BookNoteFormSkeleton /> },
  },
} satisfies Meta<typeof BookNoteFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const New: Story = {};

export const Edit: Story = {
  args: {
    title: "メモを編集",
    form: (
      <BookNoteForm
        action={fn(validateOnly)}
        defaultValues={toBookNoteFormValues(note)}
        submitLabel="保存する"
      />
    ),
  },
};

// 編集でフィールドが届く前。作成側にはこの状態が無い。
export const EditLoading: Story = {
  args: {
    title: "メモを編集",
    form: <BookNoteFormSkeleton />,
  },
};
