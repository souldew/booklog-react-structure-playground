import { useGetMonthlyStatsSuspense } from "@/generated/stats/stats";

import { toBookReadingStat } from "../mappers/toBookReadingStat";
import type { BookReadingStat } from "../../model";

// 生成された Suspense 版 hook を包み、select で mapper を通してドメイン型で返す。
// 呼ぶ側 (ClientContainer) は Suspense 境界の中にいる前提で、取得中は描かれない。
export function useBookReadingStats(): BookReadingStat[] {
  const { data } = useGetMonthlyStatsSuspense({
    query: { select: (response) => response.data.map(toBookReadingStat) },
  });
  return data;
}
