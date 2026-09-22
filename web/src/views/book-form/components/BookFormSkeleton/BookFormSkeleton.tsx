import { Skeleton } from "@/components/ui/skeleton";

// 編集画面のフィールドが届くまでの見た目。BookForm と同じ余白で、ラベル (text-sm、h-5) と入力欄 (h-8) を並べる。
// 状態の欄には編集画面と同じく補足の 1 行 (text-xs、h-4) を含める。ここがずれると送信ボタンが動く。
export function BookFormSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
