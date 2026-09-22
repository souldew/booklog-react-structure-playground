import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookNoteListSkeleton } from "./BookNoteListSkeleton";

const meta = {
  component: BookNoteListSkeleton,
} satisfies Meta<typeof BookNoteListSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
