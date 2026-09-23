import { describe, expect, it } from "vitest";

import { toBookProgressUpdate } from "./toBookProgressUpdate";

describe("toBookProgressUpdate", () => {
  it("camelCase のフォームの値を snake_case の生成型にし、数値にする", () => {
    expect(toBookProgressUpdate({ currentPage: "120" })).toEqual({ current_page: 120 });
  });
});
