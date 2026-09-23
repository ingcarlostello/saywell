import { Card, Skeleton } from '@/shared/ui';

// Decorative, shaped like the card it announces; the LiveRegion already says the answer is on its way.
export function ResultSkeleton() {
  return (
    <Card variant="elevated" padding="lg" aria-hidden>
      <div className="flex items-start gap-4">
        <Skeleton className="size-14 shrink-0 rounded-full sm:size-16" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
      <Skeleton className="mt-7 h-5 w-48" />
      <div className="mt-4 flex flex-col gap-3">
        <Skeleton className="h-7 w-full max-w-md" />
        <Skeleton className="h-7 w-full max-w-sm" />
        <Skeleton className="h-7 w-full max-w-lg" />
      </div>
      <Skeleton className="mt-6 h-14 w-full rounded-xl" />
    </Card>
  );
}
