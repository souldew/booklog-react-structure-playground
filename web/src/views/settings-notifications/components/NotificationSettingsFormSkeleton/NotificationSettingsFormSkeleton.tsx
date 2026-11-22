import { Skeleton } from "@/components/ui/skeleton";

// 項目が届くまでの見た目。NotificationSettingsForm と同じ余白で、checkbox とラベル (h-5)・説明 (text-xs、h-4) を 3 行並べる。
// 行数は通知の種類の数に合わせる。
export function NotificationSettingsFormSkeleton() {
  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 size-4" />
            <div className="space-y-0.5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
