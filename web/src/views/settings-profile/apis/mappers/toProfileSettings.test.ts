import { describe, expect, it } from "vitest";

import { toProfileSettings } from "./toProfileSettings";

describe("toProfileSettings", () => {
  it("snake_case の生成型を camelCase のドメイン型にする", () => {
    expect(toProfileSettings({ display_name: "souldew", bio: "設計の本" })).toEqual({
      displayName: "souldew",
      bio: "設計の本",
    });
  });
});
