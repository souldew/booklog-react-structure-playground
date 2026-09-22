import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { BookForm } from "../components/BookForm/BookForm";
import { BookFormSkeleton } from "../components/BookFormSkeleton/BookFormSkeleton";
import { parseBookForm } from "../lib/parseBookForm";
import { toBookFormValues } from "../lib/toBookFormValues";
import { EMPTY_BOOK_FORM_VALUES, type BookFormAction } from "../model";
import { BookFormPage } from "./BookFormPage";

const validateOnly: BookFormAction = async (state, formData) => {
  const { values, fieldErrors } = parseBookForm(formData, state.values);
  return { values, fieldErrors };
};

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// 作成と編集の差は、渡すタイトル・戻り先・BookForm の props だけ。
const meta = {
  component: BookFormPage,
  args: {
    title: "本を追加",
    backHref: "/books",
    backLabel: "一覧へ",
    form: (
      <BookForm
        action={fn(validateOnly)}
        defaultValues={EMPTY_BOOK_FORM_VALUES}
        submitLabel="追加する"
      />
    ),
  },
  parameters: {
    slots: { form: <BookFormSkeleton /> },
  },
} satisfies Meta<typeof BookFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const New: Story = {};

export const Edit: Story = {
  args: {
    title: "本を編集",
    backHref: `/books/${BOOK_FIXTURES.onHold.id}`,
    backLabel: "詳細へ",
    form: (
      <BookForm
        action={fn(validateOnly)}
        defaultValues={toBookFormValues(BOOK_FIXTURES.onHold)}
        statusLocked
        submitLabel="保存する"
      />
    ),
  },
};

// 編集でフィールドが届く前。作成側にはこの状態が無い (docs/screens.md §5)。
export const EditLoading: Story = {
  args: {
    title: "本を編集",
    backHref: `/books/${BOOK_FIXTURES.onHold.id}`,
    backLabel: "詳細へ",
    form: <BookFormSkeleton />,
  },
};
