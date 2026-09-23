import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { AppLayout } from "./AppLayout";

// body の flex-col と同じ文脈で見るため、decorator で min-h-screen の flex コンテナに包む。
const meta = {
  component: AppLayout,
  args: {
    children: <p className="text-sm text-muted-foreground">ここに画面が入る</p>,
  },
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/books" } },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("banner")).toBeVisible();
    await expect(canvas.getByRole("main")).toHaveTextContent("ここに画面が入る");
  },
};
