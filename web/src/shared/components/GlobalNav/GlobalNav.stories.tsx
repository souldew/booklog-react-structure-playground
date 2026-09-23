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

// ナビに無いパスにいるとき。どのリンクも強調されない。
export const Elsewhere: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/settings/profile" } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "本" })).not.toHaveAttribute("aria-current");
  },
};
