import { Skeleton } from "@/components/ui/skeleton";

export default function DisplaysLoading() {
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
      <div style={{ padding: "28px 32px" }} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-8 w-36 rounded-full" />
        </div>
        <div className="rounded-[4px] border border-line bg-surface">
          <div
            className="grid items-center gap-4 border-b border-line px-4 py-3"
            style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 80px" }}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-4 border-b border-line px-4 py-4 last:border-b-0"
              style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 80px" }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
