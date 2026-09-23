import { getDashboard } from "@/generated/dashboard/dashboard";

import { toDashboard } from "../mappers/toDashboard";
import type { Dashboard } from "../../model";

// ダッシュボード 1 画面ぶんを 1 回で取る。
// 本ごとに進捗を取ると N+1 になるので、組にするのは api の仕事にしてある (docs/backend.md §4)。
export async function fetchDashboard(): Promise<Dashboard> {
  const response = await getDashboard();
  return toDashboard(response.data);
}
