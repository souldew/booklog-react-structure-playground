import { describe, expect, it } from "vitest";

import { PROFILE_SETTINGS_FIXTURE } from "../fixtures/profileSettings";
import { toProfileSettingsFormValues } from "./toProfileSettingsFormValues";

describe("toProfileSettingsFormValues", () => {
  it("表示名と自己紹介をそのまま写す", () => {
    expect(toProfileSettingsFormValues(PROFILE_SETTINGS_FIXTURE)).toEqual({
      displayName: "souldew",
      bio: "設計の本を中心に読んでいます。",
    });
  });
});
