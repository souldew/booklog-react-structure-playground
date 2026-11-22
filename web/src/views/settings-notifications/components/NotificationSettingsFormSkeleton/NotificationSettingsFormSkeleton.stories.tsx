import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NotificationSettingsFormSkeleton } from "./NotificationSettingsFormSkeleton";

const meta = {
  component: NotificationSettingsFormSkeleton,
} satisfies Meta<typeof NotificationSettingsFormSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
