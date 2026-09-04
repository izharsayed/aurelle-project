import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <Skeleton className="h-4 w-3/4 rounded-none" />
      <Skeleton className="h-3 w-1/2 rounded-none" />
      <Skeleton className="h-9 w-full rounded-none" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-24 rounded-none" />
        <Skeleton className="h-9 w-2/3 rounded-none" />
        <Skeleton className="h-4 w-32 rounded-none" />
        <Skeleton className="h-20 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
    </div>
  );
}
