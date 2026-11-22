import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { GlobalNav } from "./GlobalNav";

// 現在地は parameters.nextjs.navigation.pathname で切り替える (usePathname の差し替え)。
const meta = {
  component: GlobalNav,
  parameters: {
    nextjs: { navigation: { pathname: "/books" } },
  },
} satisfies Meta<typeof GlobalNav>;

export default meta;

type Story = StoryObj<typeof meta>;

// /books にいるとき。「本」が現在地として強調され、aria-current="page" が付く。
export const OnBooks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "本" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "booklog" })).not.toHaveAttribute("aria-current");
  },
};

// 下の階層 (/books/2) でも「本」は現在地。
export const OnBookDetail: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/books/2" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "本" })).toHaveAttribute("aria-current", "page");
  },
};

// 設定のリンク先は 1 つ目のタブ (/settings/profile) だが、2 つ目のタブにいても「設定」が現在地になる。
export const OnSettingsNotifications: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/settings/notifications" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const settings = canvas.getByRole("link", { name: "設定" });
    await expect(settings).toHaveAttribute("href", "/settings/profile");
    await expect(settings).toHaveAttribute("aria-current", "page");
  },
};

// ナビに無いパスにいるとき。どのリンクも強調されない。
export const Elsewhere: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/unknown" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const link of canvas.getAllByRole("link")) {
      await expect(link).not.toHaveAttribute("aria-current");
    }
  },
};
