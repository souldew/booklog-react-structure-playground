import { describe, expect, it } from "vitest";

import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("Asia/Tokyo で日本語の日付にする", () => {
    expect(formatDate("2026-09-01T00:00:00.000Z")).toBe("2026年9月1日");
  });

  it("UTC の深夜は日本では翌日になる", () => {
    expect(formatDate("2026-09-01T20:00:00.000Z")).toBe("2026年9月2日");
  });
});
