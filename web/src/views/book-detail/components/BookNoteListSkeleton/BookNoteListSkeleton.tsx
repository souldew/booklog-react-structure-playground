import { Skeleton } from "@/components/ui/skeleton";

const ITEM_COUNT = 2;

// BookNoteList の 1 件と同じ余白。メタ行は text-xs の 1 行 (h-4)、本文は text-sm の 1 行 (h-5)。
export function BookNoteListSkeleton() {
  return (
    <ul className="divide-y rounded-md border">
      {Array.from({ length: ITEM_COUNT }, (_, index) => (
        <li key={index} className="space-y-1 p-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-full" />
        </li>
      ))}
    </ul>
  );
}
