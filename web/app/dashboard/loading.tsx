import { DashboardPageSkeleton } from "@/views/dashboard/pages/DashboardPageSkeleton";

// page.tsx を Suspense で包む Next の規約ファイル。境界はルートセグメント単位になる。
// 失敗の受け口 (error.tsx) と同じ粒度で、取得が 1 回の画面はこちらに寄せる。
export default function Loading() {
  return <DashboardPageSkeleton />;
}
