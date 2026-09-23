import { Skeleton } from "@/components/ui/skeleton";

// 編集画面のフィールドが届くまでの見た目。BookNoteForm と同じ余白で、ラベル (h-5) と入力欄を並べる。
// 本文の textarea は min-h-36 なので同じ高さにする。ここがずれると送信ボタンが動く。
export function BookNoteFormSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
