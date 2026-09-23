"use client";

import { Button } from "@/components/ui/button";

// 種類ごとの出し分けはしない (docs/overview.md スコープ外)。
// 境界は画面単位で、取得中の loading.tsx と同じ粒度。取得に失敗すれば画面全体がこれに置き換わる。
//
// 再試行は reset ではなく retry を使う。reset は再取得せずに描き直すだけなので、
// 取得の失敗では同じ結果に戻る。retry は children を取り直してから描き直す。
// Server Component から来たエラーの message は中身を伏せた汎用文になるので、
// ログと突き合わせるための digest を添える。
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">読み込みに失敗しました</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {error.digest && <p className="text-xs text-muted-foreground">digest: {error.digest}</p>}
      <Button onClick={() => retry()}>再試行</Button>
    </div>
  );
}
