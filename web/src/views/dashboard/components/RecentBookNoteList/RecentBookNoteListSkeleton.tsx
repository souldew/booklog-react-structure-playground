import { Skeleton } from "@/components/ui/skeleton";

const ITEM_COUNT = 3;

// RecentBookNoteList の 1 件と同じ余白。メタ行 (text-xs、h-4)、本文 2 行 (text-sm、h-5 × 2)。
export function RecentBookNoteListSkeleton() {
  return (
    <ul className="divide-y rounded-md border">
      {Array.from({ length: ITEM_COUNT }, (_, index) => (
        <li key={index} className="space-y-1 p-3">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </li>
      ))}
    </ul>
  );
}
