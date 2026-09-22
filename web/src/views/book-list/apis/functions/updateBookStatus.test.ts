import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Book as BookResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { updateBookStatus } from "./updateBookStatus";

// revalidatePath はリクエストの外で呼ぶと Next が例外を投げるので差し替える。
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const updated: BookResponse = {
  id: 2,
  title: "達人プログラマー",
  author: "David Thomas",
  status: "on_hold",
  total_pages: 420,
  created_at: "2026-09-02T00:00:00.000Z",
};

describe("updateBookStatus", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  it("ドメインの onHold を API の on_hold に変えて PATCH し、成功なら一覧を再検証する", async () => {
    const requests = stubFetch([{ status: 200, body: updated }]);

    const result = await updateBookStatus("2", "onHold");

    expect(result).toEqual({ ok: true });
    expect(requests).toEqual([{ method: "PATCH", path: "/books/2", body: { status: "on_hold" } }]);
    expect(revalidatePath).toHaveBeenCalledWith("/books");
  });

  it("失敗は throw せず値で返し、再検証もしない", async () => {
    stubFetch([{ status: 500, body: { message: "failed on purpose" } }]);

    const result = await updateBookStatus("2", "finished");

    expect(result).toEqual({ ok: false, message: "api responded with 500" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
