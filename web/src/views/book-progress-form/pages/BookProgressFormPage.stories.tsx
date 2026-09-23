import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { BOOK_PROGRESS_FIXTURE } from "@/features/book-progress/fixtures/bookProgress";
import { BOOK_FIXTURES } from "@/features/book/fixtures/books";

import { BookProgressForm } from "../components/BookProgressForm/BookProgressForm";
import { BookProgressFormSkeleton } from "../components/BookProgressFormSkeleton/BookProgressFormSkeleton";
import { parseBookProgressForm } from "../lib/parseBookProgressForm";
import { toBookProgressFormValues } from "../lib/toBookProgressFormValues";
import type { BookProgressFormAction } from "../model";
import { BookProgressFormPage } from "./BookProgressFormPage";

const book = BOOK_FIXTURES.reading;

const validateOnly: BookProgressFormAction = async (_state, formData) =>
  parseBookProgressForm(formData, book.totalPages);

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
const meta = {
  component: BookProgressFormPage,
  args: {
    bookId: book.id,
    form: (
      <BookProgressForm
        action={fn(validateOnly)}
        defaultValues={toBookProgressFormValues(BOOK_PROGRESS_FIXTURE)}
        totalPages={book.totalPages}
        updatedAt={BOOK_PROGRESS_FIXTURE.updatedAt}
      />
    ),
  },
  parameters: {
    slots: { form: <BookProgressFormSkeleton /> },
  },
} satisfies Meta<typeof BookProgressFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "← 詳細へ" })).toHaveAttribute(
      "href",
      "/books/2",
    );
  },
};

// フィールドが届く前。単一リソースは常に取得するので、この状態が必ずある (作成が無い book-form の New とは逆)。
export const Loading: Story = {
  args: { form: <BookProgressFormSkeleton /> },
};
