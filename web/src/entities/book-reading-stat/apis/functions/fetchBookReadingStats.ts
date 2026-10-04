import { getMonthlyStats } from "@/generated/stats/stats";

import { toBookReadingStat } from "../mappers/toBookReadingStat";
import type { BookReadingStat } from "../../model";

// 直近数か月の月別統計。新しい月が先。並びと月数は api が決める。
export async function fetchBookReadingStats(): Promise<BookReadingStat[]> {
  const response = await getMonthlyStats();
  return response.data.map(toBookReadingStat);
}
