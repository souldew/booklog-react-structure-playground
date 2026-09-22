import { describe, expect, it } from "vitest";

import { BOOK_STATUSES } from "../../model";
import { toBookStatus, toBookStatusResponse } from "./mapBookStatus";

describe("mapBookStatus", () => {
  it("API の on_hold をドメインの onHold にする", () => {
    expect(toBookStatus("on_hold")).toBe("onHold");
    expect(toBookStatusResponse("onHold")).toBe("on_hold");
  });

  it("すべての状態が往復で元に戻る", () => {
    for (const status of BOOK_STATUSES) {
      expect(toBookStatus(toBookStatusResponse(status))).toBe(status);
    }
  });
});
