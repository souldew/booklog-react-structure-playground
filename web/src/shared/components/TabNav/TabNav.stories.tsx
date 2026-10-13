import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { TabNav } from "./TabNav";

// 現在地は parameters.nextjs.navigation.pathname で切り替える (usePathname の差し替え)。
const meta = {
  component: TabNav,
  args: {
    label: "設定",
    links: [
      { href: "/settings/profile", label: "プロフィール" },
      { href: "/settings/notifications", label: "通知" },
    ],
  },
  parameters: {
    nextjs: { navigation: { pathname: "/settings/profile" } },
  },
} satisfies Meta<typeof TabNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const First: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "設定" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "プロフィール" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "通知" })).not.toHaveAttribute("aria-current");
  },
};

export const Second: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/settings/notifications" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "通知" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(canvas.getByRole("link", { name: "プロフィール" })).not.toHaveAttribute(
      "aria-current",
    );
  },
};
