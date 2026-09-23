import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookNoteFormSkeleton } from "./BookNoteFormSkeleton";

const meta = {
  component: BookNoteFormSkeleton,
} satisfies Meta<typeof BookNoteFormSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
