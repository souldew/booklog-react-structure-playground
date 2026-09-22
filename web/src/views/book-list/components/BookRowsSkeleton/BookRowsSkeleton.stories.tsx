import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Table } from "@/components/ui/table";

import { BookRowsSkeleton } from "./BookRowsSkeleton";

// <tbody> なので Table で包む。
const meta = {
  component: BookRowsSkeleton,
  decorators: [
    (Story) => (
      <Table>
        <Story />
      </Table>
    ),
  ],
} satisfies Meta<typeof BookRowsSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
