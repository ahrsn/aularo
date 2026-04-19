import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper"
        style={{ height: 52, padding: "0 28px" }}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <span className="text-line-strong">/</span>
          <Skeleton className="h-3 w-20" />
        </div>
      </header>
      <div style={{ padding: "28px 32px" }} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="rounded-[4px] border border-line bg-surface p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[4px] border border-line bg-surface p-4 flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </>
  );
}
