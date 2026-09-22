import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookFormSkeleton } from "./BookFormSkeleton";

const meta = {
  component: BookFormSkeleton,
} satisfies Meta<typeof BookFormSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
