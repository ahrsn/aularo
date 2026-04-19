import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </>
  );
}
