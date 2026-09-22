import { Skeleton } from "@/components/ui/skeleton";

const ITEM_COUNT = 2;

export function BookNoteListSkeleton() {
  return (
    <ul className="divide-y rounded-md border">
      {Array.from({ length: ITEM_COUNT }, (_, index) => (
        <li key={index} className="space-y-2 p-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-4 w-full" />
        </li>
      ))}
    </ul>
  );
}
