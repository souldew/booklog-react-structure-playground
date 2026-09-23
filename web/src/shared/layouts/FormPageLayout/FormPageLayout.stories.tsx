import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { FormPageLayout } from "./FormPageLayout";

const meta = {
  component: FormPageLayout,
  args: {
    title: "本を追加",
    backHref: "/books",
    backLabel: "一覧へ",
    children: <p className="text-sm text-muted-foreground">ここにフォームが入る</p>,
  },
} satisfies Meta<typeof FormPageLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "← 一覧へ" })).toHaveAttribute("href", "/books");
    await expect(canvas.getByRole("heading", { name: "本を追加" })).toBeVisible();
  },
};
