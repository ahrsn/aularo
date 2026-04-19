import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
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
        <Skeleton className="h-8 w-32 rounded-full" />
      </header>
      <div style={{ padding: "28px 32px" }} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-3"
            >
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
