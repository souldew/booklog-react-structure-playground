import { describe, expect, it } from "vitest";

import { toBookUpdate } from "./toBookUpdate";

const values = { title: "t", author: "a", totalPages: "120", status: "onHold" as const };

describe("toBookUpdate", () => {
  it("status が送信されていれば API の語に変えて含める", () => {
    expect(toBookUpdate(values, "finished")).toEqual({
      title: "t",
      author: "a",
      total_pages: 120,
      status: "finished",
    });
  });

  // disabled な select は送信されない。values.status は再表示用なので body には使わない。
  it("status が送信されていなければ body に含めない。values.status があっても使わない", () => {
    const body = toBookUpdate(values, undefined);

    expect(body).toEqual({ title: "t", author: "a", total_pages: 120 });
    expect("status" in body).toBe(false);
  });
});
