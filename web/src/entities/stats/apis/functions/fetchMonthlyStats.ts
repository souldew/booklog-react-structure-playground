import { getMonthlyStats } from "@/generated/stats/stats";

import { toMonthlyStat } from "../mappers/toMonthlyStat";
import type { MonthlyStat } from "../../model";

// 直近数か月の月別統計。新しい月が先。並びと月数は api が決める。
export async function fetchMonthlyStats(): Promise<MonthlyStat[]> {
  const response = await getMonthlyStats();
  return response.data.map(toMonthlyStat);
}
