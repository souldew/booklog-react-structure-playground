import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationSettings as NotificationSettingsResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { NOTIFICATION_SETTINGS_FIXTURE } from "../../fixtures/notificationSettings";
import type { NotificationSettingsFormState } from "../../model";
import { updateNotificationSettings } from "./updateNotificationSettings";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const state: NotificationSettingsFormState = { values: NOTIFICATION_SETTINGS_FIXTURE };

const updated: NotificationSettingsResponse = {
  reading_reminder: false,
  weekly_summary: true,
  note_digest: true,
};

describe("updateNotificationSettings", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  it("チェックを外した項目も false として全項目を PUT し、同じ画面を再検証して saved を返す", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    const result = await updateNotificationSettings(
      state,
      formDataOf({ weeklySummary: "on", noteDigest: "on" }),
    );

    expect(requests).toEqual([
      {
        method: "PUT",
        path: "/settings/notifications",
        body: { reading_reminder: false, weekly_summary: true, note_digest: true },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/notifications");
    expect(result).toEqual({
      values: { readingReminder: false, weeklySummary: true, noteDigest: true },
      saved: true,
    });
  });

  it("API の失敗は message で返し、送った値を残して再検証しない", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    const result = await updateNotificationSettings(state, formDataOf({ noteDigest: "on" }));

    expect(result).toEqual({
      values: { readingReminder: false, weeklySummary: false, noteDigest: true },
      message: "api responded with 500",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
