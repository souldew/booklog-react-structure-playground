import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BookProgressFormSkeleton } from "./BookProgressFormSkeleton";

const meta = {
  component: BookProgressFormSkeleton,
} satisfies Meta<typeof BookProgressFormSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
