"use client";

import { Button } from "@/components/ui/button";

// 種類ごとの出し分けはしない (docs/overview.md スコープ外)。
// settings/layout.tsx の内側に入るので、取得に失敗してもタブバーは残り、もう一方のタブへは移れる。
//
// 再試行は reset ではなく retry を使う。reset は再取得せずに描き直すだけなので、
// 取得の失敗では同じ結果に戻る。retry は children を取り直してから描き直す。
export default function SettingsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">読み込みに失敗しました</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {error.digest && <p className="text-xs text-muted-foreground">digest: {error.digest}</p>}
      <Button onClick={() => retry()}>再試行</Button>
    </div>
  );
}
