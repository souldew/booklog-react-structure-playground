import { Skeleton } from "@/components/ui/skeleton";

const ITEM_COUNT = 2;

// ReadingBookList の 1 件と同じ余白。タイトル (text-sm、h-5)、ラベルと百分率の行 (h-5)、バー (h-1)。
export function ReadingBookListSkeleton() {
  return (
    <ul className="divide-y rounded-md border">
      {Array.from({ length: ITEM_COUNT }, (_, index) => (
        <li key={index} className="space-y-2 p-3">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </li>
      ))}
    </ul>
  );
}
