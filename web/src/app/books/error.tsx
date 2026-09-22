"use client";

import { Button } from "@/components/ui/button";

// 種類ごとの出し分けはしない (docs/overview.md スコープ外)。?fail=1 で api が 500 を返したときにここに落ちる。
export default function BooksError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">読み込みに失敗しました</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}
