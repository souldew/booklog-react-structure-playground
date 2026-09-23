import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/components/ui/input";

import { FormField } from "./FormField";

const meta = {
  component: FormField,
  args: {
    id: "title",
    label: "タイトル",
    children: <Input id="title" name="title" defaultValue="達人プログラマー" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "状態は一覧の読了トグルで変えます" },
};

// error があるときは hint を出さない。入力欄側の aria-invalid はこの部品ではなく親が付ける。
export const WithError: Story = {
  args: {
    error: "タイトルを入力してください",
    hint: "error があるので出ない",
    children: <Input id="title" name="title" aria-invalid aria-describedby="title-error" />,
  },
};
