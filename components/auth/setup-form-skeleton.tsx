import { Skeleton } from "@/components/ui/skeleton";

export function SetupFormSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading setup form">
      <Skeleton className="h-4 w-3/4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
