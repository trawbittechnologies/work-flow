import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#071A49] border border-[#DDE2D8] dark:border-[#1E3A7B] rounded-[2px] p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-[2px] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-[2px]" />
          <Skeleton className="h-3 w-1/2 rounded-[2px]" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded-[2px]" />
      <Skeleton className="h-1 w-full rounded-[2px]" />
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-6 rounded-[2px] ring-2 ring-white dark:ring-[#071A49]" />
          ))}
        </div>
        <Skeleton className="h-3 w-16 rounded-[2px]" />
      </div>
    </div>
  );
}

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4">
      <Skeleton className="h-4 w-4 rounded-[2px] flex-shrink-0" />
      <Skeleton className="h-4 flex-1 rounded-[2px]" />
      <Skeleton className="h-5 w-16 rounded-[2px]" />
      <Skeleton className="h-5 w-14 rounded-[2px]" />
      <Skeleton className="h-6 w-6 rounded-[2px] flex-shrink-0" />
      <Skeleton className="h-4 w-20 rounded-[2px]" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#071A49] border border-[#DDE2D8] dark:border-[#1E3A7B] rounded-[2px] p-5 space-y-2 shadow-xs">
      <Skeleton className="h-4 w-24 rounded-[2px]" />
      <Skeleton className="h-8 w-16 rounded-[2px]" />
    </div>
  );
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="h-7 w-7 rounded-[2px] flex-shrink-0" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <Skeleton className="h-3.5 w-3/4 rounded-[2px]" />
        <Skeleton className="h-3 w-1/3 rounded-[2px]" />
      </div>
    </div>
  );
}
