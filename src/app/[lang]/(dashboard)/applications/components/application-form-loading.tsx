import { Skeleton } from '@/components/ui/skeleton';

export function ApplicationFormLoading() {
  return (
    <div className="pt-6">
      <div className="mb-8 space-y-1">
        <Skeleton className="h-5 w-2/6" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex flex-col space-y-6">
        {Array(3)
          .fill({})
          .map((_, i) => (
            <div key={`skeleton-tab-${i}`} className="space-y-1">
              <Skeleton className="h-4 w-2/6" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
      </div>
    </div>
  );
}
