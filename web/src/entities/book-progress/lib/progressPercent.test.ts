import { describe, expect, it } from "vitest";

import { progressPercent } from "./progressPercent";

describe("progressPercent", () => {
  it("四捨五入した整数の百分率にする", () => {
    expect(progressPercent(120, 420)).toBe(29);
    expect(progressPercent(0, 420)).toBe(0);
    expect(progressPercent(420, 420)).toBe(100);
  });

  it("ページ数が 0 なら 0、超えていても 100 で止める", () => {
    expect(progressPercent(10, 0)).toBe(0);
    expect(progressPercent(500, 420)).toBe(100);
  });
});
