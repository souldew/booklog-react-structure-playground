import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { SettingsLayout } from "./SettingsLayout";

// タブの現在地の切り替えは TabNav の story で見る。ここは枠 (見出し・タブ・中身の位置) だけを見る。
const meta = {
  component: SettingsLayout,
  args: {
    children: <p className="text-sm text-muted-foreground">ここにタブの中身が入る</p>,
  },
  parameters: {
    nextjs: { navigation: { pathname: "/settings/profile" } },
  },
} satisfies Meta<typeof SettingsLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "設定" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "プロフィール" })).toHaveAttribute(
      "href",
      "/settings/profile",
    );
    await expect(canvas.getByRole("link", { name: "通知" })).toHaveAttribute(
      "href",
      "/settings/notifications",
    );
    await expect(canvas.getByText("ここにタブの中身が入る")).toBeVisible();
  },
};
