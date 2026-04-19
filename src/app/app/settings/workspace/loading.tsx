import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSettingsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <Skeleton className="h-5 w-16" />
        <div className="rounded-[4px] border border-line">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
