"use client";

import { Button } from "@/components/ui/button";

// 種類ごとの出し分けはしない (docs/overview.md スコープ外)。?fail=1 で api が 500 を返したときにここに落ちる。
//
// 再試行は reset ではなく retry を使う。reset は再取得せずに描き直すだけなので、
// 取得の失敗では同じ結果に戻る。retry は children を取り直してから描き直す。
export default function BooksError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">読み込みに失敗しました</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={() => retry()}>再試行</Button>
    </div>
  );
}
