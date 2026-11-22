import { Skeleton } from "@/components/ui/skeleton";

// フィールドが届くまでの見た目。ProfileSettingsForm と同じ余白で、ラベル (h-5)、入力欄、補足 (text-xs、h-4) を並べる。
// 自己紹介の textarea は min-h-24 なので同じ高さにする。ここがずれると送信ボタンが動く。
export function ProfileSettingsFormSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
