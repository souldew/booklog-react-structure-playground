import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { expectStable } from "@/shared/fixtures/expectStable";

import { NotificationSettingsForm } from "../components/NotificationSettingsForm/NotificationSettingsForm";
import { NotificationSettingsFormSkeleton } from "../components/NotificationSettingsFormSkeleton/NotificationSettingsFormSkeleton";
import { NOTIFICATION_SETTINGS_FIXTURE } from "../fixtures/notificationSettings";
import { SettingsNotificationsPage } from "./SettingsNotificationsPage";

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// タブバーはレイアウトの持ち物なので、この story には出ない。
const meta = {
  component: SettingsNotificationsPage,
  args: {
    form: (
      <NotificationSettingsForm
        action={fn(async (state) => state)}
        defaultValues={NOTIFICATION_SETTINGS_FIXTURE}
      />
    ),
  },
  parameters: {
    slots: { form: <NotificationSettingsFormSkeleton /> },
  },
} satisfies Meta<typeof SettingsNotificationsPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "通知" })).toBeVisible();
    await expect(canvas.queryByRole("navigation")).toBeNull();
  },
};

// 項目が届く前。単一リソースは常に取得するので、この状態が必ずある。
export const Loading: Story = {
  args: { form: <NotificationSettingsFormSkeleton /> },
};

// Skeleton から項目に切り替わる前後で、下にある要素が動かないこと。
export const NoLayoutShift: Story = {
  globals: { slotDelay: 800 },
  render: (args) => (
    <div>
      <SettingsNotificationsPage {...args} />
      <p data-testid="below">下にある要素</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectStable(canvas.getByTestId("below"), () =>
      canvas.getByRole("checkbox", { name: "週のまとめ" }),
    );
  },
};
