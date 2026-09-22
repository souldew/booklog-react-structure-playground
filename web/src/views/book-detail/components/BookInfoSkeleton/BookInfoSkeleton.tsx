import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 5;

export function BookInfoSkeleton() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
      {Array.from({ length: ROW_COUNT }, (_, index) => (
        <div key={index} className="contents">
          <Skeleton className="h-5 w-14" />
          <Skeleton className={index === 2 ? "h-5 w-14 rounded-full" : "h-5 w-56"} />
        </div>
      ))}
    </div>
  );
}
