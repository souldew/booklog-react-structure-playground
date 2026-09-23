import { describe, expect, it } from "vitest";

import { formatMonth } from "./formatMonth";

describe("formatMonth", () => {
  it("YYYY-MM を YYYY年M月 にし、月の先頭の 0 を落とす", () => {
    expect(formatMonth("2026-09")).toBe("2026年9月");
    expect(formatMonth("2026-12")).toBe("2026年12月");
  });
});
