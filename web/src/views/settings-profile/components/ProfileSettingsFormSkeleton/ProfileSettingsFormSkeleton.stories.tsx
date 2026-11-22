import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProfileSettingsFormSkeleton } from "./ProfileSettingsFormSkeleton";

const meta = {
  component: ProfileSettingsFormSkeleton,
} satisfies Meta<typeof ProfileSettingsFormSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
