import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper"
        style={{ height: 52, padding: "0 28px" }}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <span className="text-line-strong">/</span>
          <Skeleton className="h-3 w-16" />
        </div>
      </header>
      <div style={{ padding: "28px 32px" }} className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-[4px] border border-line bg-surface p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-5"
            >
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
