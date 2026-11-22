import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProfileSettings as ProfileSettingsResponse } from "@/generated/model";
import { formDataOf } from "@/shared/fixtures/formDataOf";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import type { ProfileSettingsFormState } from "../../model";
import { updateProfileSettings } from "./updateProfileSettings";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const state: ProfileSettingsFormState = {
  values: { displayName: "souldew", bio: "" },
  fieldErrors: {},
};

const updated: ProfileSettingsResponse = {
  display_name: "souldew2",
  bio: "設計の本を読む",
};

describe("updateProfileSettings", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  it("id 無しのパスに PUT し、同じ画面を再検証して、保存した値と saved を返す", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    const result = await updateProfileSettings(
      state,
      formDataOf({ displayName: " souldew2 ", bio: "設計の本を読む" }),
    );

    expect(requests).toEqual([
      {
        method: "PUT",
        path: "/settings/profile",
        body: { display_name: "souldew2", bio: "設計の本を読む" },
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/settings/profile");
    expect(result).toEqual({
      values: { displayName: "souldew2", bio: "設計の本を読む" },
      fieldErrors: {},
      saved: true,
    });
  });

  it("検証に落ちたら通信せずに返し、saved は付けない", async () => {
    const requests = stubFetch([]);

    const result = await updateProfileSettings(
      { ...state, saved: true },
      formDataOf({ displayName: "", bio: "" }),
    );

    expect(requests).toEqual([]);
    expect(result.fieldErrors.displayName).toBe("表示名を入力してください");
    expect(result.saved).toBeUndefined();
  });

  it("API の失敗は message で返し、再検証しない", async () => {
    stubFetch([{ status: 500, body: { message: "boom" } }]);

    const result = await updateProfileSettings(state, formDataOf({ displayName: "a", bio: "" }));

    expect(result.message).toBe("api responded with 500");
    expect(result.saved).toBeUndefined();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
