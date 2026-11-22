import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { expectStable } from "@/shared/fixtures/expectStable";

import { ProfileSettingsForm } from "../components/ProfileSettingsForm/ProfileSettingsForm";
import { ProfileSettingsFormSkeleton } from "../components/ProfileSettingsFormSkeleton/ProfileSettingsFormSkeleton";
import { PROFILE_SETTINGS_FIXTURE } from "../fixtures/profileSettings";
import { parseProfileSettingsForm } from "../lib/parseProfileSettingsForm";
import { toProfileSettingsFormValues } from "../lib/toProfileSettingsFormValues";
import type { ProfileSettingsFormAction } from "../model";
import { SettingsProfilePage } from "./SettingsProfilePage";

const validateOnly: ProfileSettingsFormAction = async (_state, formData) =>
  parseProfileSettingsForm(formData);

// スロットには取得後の Presentational や Skeleton を直接渡す。Container と Suspense は story では使わない。
// タブバーはレイアウトの持ち物なので、この story には出ない。
const meta = {
  component: SettingsProfilePage,
  args: {
    form: (
      <ProfileSettingsForm
        action={fn(validateOnly)}
        defaultValues={toProfileSettingsFormValues(PROFILE_SETTINGS_FIXTURE)}
      />
    ),
  },
  parameters: {
    slots: { form: <ProfileSettingsFormSkeleton /> },
  },
} satisfies Meta<typeof SettingsProfilePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "プロフィール" })).toBeVisible();
    await expect(canvas.queryByRole("navigation")).toBeNull();
  },
};

// フィールドが届く前。単一リソースは常に取得するので、この状態が必ずある。
export const Loading: Story = {
  args: { form: <ProfileSettingsFormSkeleton /> },
};

// Skeleton からフォームに切り替わる前後で、送信ボタンの位置が動かないこと。
export const NoLayoutShift: Story = {
  globals: { slotDelay: 800 },
  render: (args) => (
    <div>
      <SettingsProfilePage {...args} />
      <p data-testid="below">下にある要素</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectStable(canvas.getByTestId("below"), () => canvas.getByLabelText("表示名"));
  },
};
