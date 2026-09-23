import { Skeleton } from "@/components/ui/skeleton";

// フィールドが届くまでの見た目。BookProgressForm と同じ余白で、ラベル (h-5)、入力欄 (h-8)、補足 (text-xs、h-4) を並べる。
export function BookProgressFormSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
