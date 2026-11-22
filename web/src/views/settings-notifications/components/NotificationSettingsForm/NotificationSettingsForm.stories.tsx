import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { NOTIFICATION_SETTINGS_FIXTURE } from "../../fixtures/notificationSettings";
import { parseNotificationSettingsForm } from "../../lib/parseNotificationSettingsForm";
import type { NotificationSettingsFormAction } from "../../model";
import { NotificationSettingsForm } from "./NotificationSettingsForm";

// Server Action の代わり。FormData を読んで保存できたことにして返す。通信はしない。
const saveLocally: NotificationSettingsFormAction = async (_state, formData) => ({
  values: parseNotificationSettingsForm(formData),
  saved: true,
});

const meta = {
  component: NotificationSettingsForm,
  args: {
    action: fn(saveLocally),
    defaultValues: NOTIFICATION_SETTINGS_FIXTURE,
  },
} satisfies Meta<typeof NotificationSettingsForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: "読書のリマインダー" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "週のまとめ" })).toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "メモの振り返り" })).not.toBeChecked();
  },
};

// チェックを外した項目は FormData に含まれない。保存後も画面を離れず、送った状態のまま結果が出る。
export const Saved: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "読書のリマインダー" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "メモの振り返り" }));
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    const [, formData] = args.action.mock.calls[0]!;
    await expect(formData.has("readingReminder")).toBe(false);
    await expect(formData.get("noteDigest")).toBe("on");

    await expect(canvas.getByRole("status")).toHaveTextContent("保存しました");
    await expect(canvas.getByRole("checkbox", { name: "読書のリマインダー" })).not.toBeChecked();
    await expect(canvas.getByRole("checkbox", { name: "メモの振り返り" })).toBeChecked();
  },
};

// API に失敗したとき。form 全体のメッセージとして出て、送った状態は残る。
export const SubmitFails: Story = {
  args: {
    action: fn<NotificationSettingsFormAction>(async (_state, formData) => ({
      values: parseNotificationSettingsForm(formData),
      message: "api responded with 500",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "週のまとめ" }));
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByRole("alert")).toHaveTextContent("api responded with 500");
    await expect(canvas.getByRole("checkbox", { name: "週のまとめ" })).not.toBeChecked();
    await expect(canvas.getByRole("status")).toHaveTextContent("");
  },
};
