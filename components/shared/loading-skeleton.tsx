
/**
 * Loading Skeleton Component
 */

import { cn } from "@/lib/utils";

type SkeletonVariant = "card" | "list" | "table" | "stats";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  height?: number;
  className?: string;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-lg bg-muted",
      className
    )}
  />
);

const CardSkeleton = ({ height }: { height?: number }) => (
  <div
    className="rounded-xl border border-border/60 bg-card p-6"
    style={height ? { minHeight: `${height}px` } : undefined}
  >
    {height ? (
      <Skeleton className="h-full w-full rounded-lg" />
    ) : (
      <>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </>
    )}
  </div>
);

const ListSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16 rounded-xl" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="w-full overflow-hidden rounded-xl border border-border/60">
    <div className="flex gap-4 border-b border-border/60 bg-muted/30 p-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="divide-y divide-border/60">
      <div className="flex gap-4 p-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-5 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-8 w-24" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  </div>
);

export function LoadingSkeleton({
  variant = "card",
  count = 1,
  height,
  className,
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return <CardSkeleton height={height} />;
      case "list":
        return <ListSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "stats":
        return <StatsSkeleton />;
      default:
        return <CardSkeleton height={height} />;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn(index > 0 && "mt-4")}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
