import { describe, expect, it } from "vitest";

import { isCurrentPath } from "./isCurrentPath";

describe("isCurrentPath", () => {
  it("同じパスと、その下の階層を現在地とみなす", () => {
    expect(isCurrentPath("/books", "/books")).toBe(true);
    expect(isCurrentPath("/books/2/notes", "/books")).toBe(true);
  });

  it("語の途中で一致しても現在地にしない", () => {
    expect(isCurrentPath("/bookshelf", "/books")).toBe(false);
  });

  it("/ は完全一致だけ", () => {
    expect(isCurrentPath("/", "/")).toBe(true);
    expect(isCurrentPath("/books", "/")).toBe(false);
  });
});
