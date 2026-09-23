import { describe, expect, it } from "vitest";

import type { MonthlyStat as MonthlyStatResponse } from "@/generated/model";
import { stubFetch } from "@/shared/fixtures/stubFetch";

import { fetchMonthlyStats } from "./fetchMonthlyStats";

const responses: MonthlyStatResponse[] = [
  { month: "2026-09", books_added: 1, pages_added: 600, notes_written: 0 },
  { month: "2026-08", books_added: 1, pages_added: 312, notes_written: 1 },
];

describe("fetchMonthlyStats", () => {
  it("GET /stats/monthly の各要素を mapper に通し、並びは変えない", async () => {
    const requests = stubFetch([{ status: 200, body: responses }]);

    const stats = await fetchMonthlyStats();

    expect(requests).toEqual([{ method: "GET", path: "/stats/monthly", body: undefined }]);
    expect(stats.map((stat) => stat.month)).toEqual(["2026-09", "2026-08"]);
    expect(stats[0]).toEqual({ month: "2026-09", booksAdded: 1, pagesAdded: 600, notesWritten: 0 });
  });
});
