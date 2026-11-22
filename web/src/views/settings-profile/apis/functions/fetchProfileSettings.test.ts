import { describe, expect, it } from "vitest";

import type { ProfileSettings as ProfileSettingsResponse } from "@/generated/model";
import { ApiError } from "@/shared/apis/customFetch";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchProfileSettings } from "./fetchProfileSettings";

const response: ProfileSettingsResponse = {
  display_name: "souldew",
  bio: "設計の本を中心に読んでいます。",
};

describe("fetchProfileSettings", () => {
  it("id の無いパスを GET し、mapper を通してドメイン型で返す", async () => {
    const requests = stubFetch([{ status: 200, body: response }]);

    const settings = await fetchProfileSettings();

    expect(requests).toEqual([{ method: "GET", path: "/settings/profile", body: undefined }]);
    expect(settings.displayName).toBe("souldew");
  });

  it("失敗は ApiError のまま投げる", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    await expect(fetchProfileSettings()).rejects.toBeInstanceOf(ApiError);
  });
});
