import { Skeleton } from "@/components/ui/skeleton";

export default function IntegrationsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96" />
      </section>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[4px] border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
