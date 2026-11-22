import { describe, expect, it } from "vitest";

import { toProfileSettingsUpdate } from "./toProfileSettingsUpdate";

describe("toProfileSettingsUpdate", () => {
  it("camelCase のフォームの値を snake_case の生成型にし、空の自己紹介も送る", () => {
    expect(toProfileSettingsUpdate({ displayName: "souldew", bio: "" })).toEqual({
      display_name: "souldew",
      bio: "",
    });
  });
});
