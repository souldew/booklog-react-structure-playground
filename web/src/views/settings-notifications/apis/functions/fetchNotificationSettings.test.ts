import { describe, expect, it } from "vitest";

import type { NotificationSettings as NotificationSettingsResponse } from "@/generated/model";
import { ApiError } from "@/shared/apis/customFetch";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchNotificationSettings } from "./fetchNotificationSettings";

const response: NotificationSettingsResponse = {
  reading_reminder: true,
  weekly_summary: true,
  note_digest: false,
};

describe("fetchNotificationSettings", () => {
  it("id の無いパスを GET し、mapper を通してドメイン型で返す", async () => {
    const requests = stubFetch([{ status: 200, body: response }]);

    const settings = await fetchNotificationSettings();

    expect(requests).toEqual([{ method: "GET", path: "/settings/notifications", body: undefined }]);
    expect(settings.noteDigest).toBe(false);
  });

  it("失敗は ApiError のまま投げる", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    await expect(fetchNotificationSettings()).rejects.toBeInstanceOf(ApiError);
  });
});
