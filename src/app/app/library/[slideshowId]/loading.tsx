import { Skeleton } from "@/components/ui/skeleton";

export default function SlideshowBuilderLoading() {
  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: "280px 1fr 320px" }}>
      <aside className="border-r border-line bg-surface p-4 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </aside>
      <main className="flex flex-col">
        <header
          className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper"
          style={{ height: 52, padding: "0 28px" }}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <span className="text-line-strong">/</span>
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <Skeleton className="aspect-video w-full max-w-4xl" />
        </div>
      </main>
      <aside className="border-l border-line bg-surface p-4 flex flex-col gap-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </aside>
    </div>
  );
}
