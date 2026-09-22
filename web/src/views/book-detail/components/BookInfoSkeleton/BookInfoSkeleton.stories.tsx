import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookInfoSkeleton } from "./BookInfoSkeleton";

const meta = {
  component: BookInfoSkeleton,
} satisfies Meta<typeof BookInfoSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
