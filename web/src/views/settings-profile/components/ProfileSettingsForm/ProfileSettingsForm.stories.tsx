import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { PROFILE_SETTINGS_FIXTURE } from "../../fixtures/profileSettings";
import { parseProfileSettingsForm } from "../../lib/parseProfileSettingsForm";
import { toProfileSettingsFormValues } from "../../lib/toProfileSettingsFormValues";
import type { ProfileSettingsFormAction } from "../../model";
import { ProfileSettingsForm } from "./ProfileSettingsForm";

// Server Action の代わり。検証に通れば保存できたことにして返す。通信はしない。
const saveLocally: ProfileSettingsFormAction = async (_state, formData) => {
  const parsed = parseProfileSettingsForm(formData);
  if (Object.keys(parsed.fieldErrors).length > 0) return parsed;
  return { ...parsed, saved: true };
};

const meta = {
  component: ProfileSettingsForm,
  args: {
    action: fn(saveLocally),
    defaultValues: toProfileSettingsFormValues(PROFILE_SETTINGS_FIXTURE),
  },
} satisfies Meta<typeof ProfileSettingsForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// 単一リソースなので New に相当する story は無い。
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("表示名")).toHaveValue("souldew");
    await expect(canvas.getByLabelText("自己紹介")).toHaveValue("設計の本を中心に読んでいます。");
    await expect(canvas.getByRole("status")).toHaveTextContent("");
  },
};

// 保存しても画面を離れず、同じフォームに結果が出る。入力欄には保存した値が残る。
export const Saved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("表示名");
    await userEvent.clear(input);
    await userEvent.type(input, "souldew2");
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByRole("status")).toHaveTextContent("保存しました");
    await expect(canvas.getByLabelText("表示名")).toHaveValue("souldew2");
  },
};

// 入力のたびに残り文字数が変わり、上限を超えると超えた分を赤で出す。判定だけで、送信は止めない。
export const BioCounter: Story = {
  args: { defaultValues: { displayName: "souldew", bio: "" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bio = canvas.getByLabelText("自己紹介");
    await expect(canvas.getByText("残り 160 文字")).toBeVisible();

    await userEvent.type(bio, "設計の本");
    await expect(canvas.getByText("残り 156 文字")).toBeVisible();

    await userEvent.clear(bio);
    await userEvent.click(bio);
    await userEvent.paste("あ".repeat(163));
    const over = canvas.getByText("3 文字オーバーしています (上限 160 文字)");
    await expect(over).toHaveClass("text-destructive");
    await expect(canvas.getByRole("button", { name: "保存する" })).toBeEnabled();
  },
};

// 上限超えで保存して検証のエラーが出たあと、書き直すとエラーは消え、残り文字数の判定だけが残る。
export const BioErrorClearsOnEdit: Story = {
  args: { defaultValues: { displayName: "souldew", bio: "" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bio = canvas.getByLabelText("自己紹介");
    await userEvent.click(bio);
    await userEvent.paste("あ".repeat(161));
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));
    await expect(canvas.getByText("自己紹介は 160 文字以内で入力してください")).toBeVisible();

    await userEvent.type(canvas.getByLabelText("自己紹介"), "{Backspace}");
    await expect(canvas.getByText("残り 0 文字")).toBeVisible();
    await expect(canvas.queryByText("自己紹介は 160 文字以内で入力してください")).toBeNull();
    await expect(canvas.getByLabelText("自己紹介")).not.toHaveAttribute("aria-invalid");
  },
};

// 保存すると、自己紹介は Server Action が返した値 (前後の空白を落とした値) に揃い直し、残り文字数もそれに従う。
export const BioSyncsAfterSave: Story = {
  args: { defaultValues: { displayName: "souldew", bio: "" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("自己紹介"), "  設計  ");
    await expect(canvas.getByText("残り 158 文字")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByRole("status")).toHaveTextContent("保存しました");
    await expect(canvas.getByLabelText("自己紹介")).toHaveValue("設計");
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByLabelText("表示名"));
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByText("表示名を入力してください")).toBeVisible();
    await expect(canvas.getByLabelText("表示名")).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("");
  },
};

// API に失敗したとき。項目ではなく form 全体のメッセージとして出て、入力値は残る。
export const SubmitFails: Story = {
  args: {
    action: fn<ProfileSettingsFormAction>(async (state) => ({
      values: state.values,
      fieldErrors: {},
      message: "api responded with 500",
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "保存する" }));

    await expect(canvas.getByRole("alert")).toHaveTextContent("api responded with 500");
    await expect(canvas.getByLabelText("表示名")).toHaveValue("souldew");
  },
};
