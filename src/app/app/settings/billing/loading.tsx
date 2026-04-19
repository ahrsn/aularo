import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80" />
      </section>
      <section
        className="rounded-[4px] p-6 flex flex-col gap-4"
        style={{ background: "#19231A" }}
      >
        <Skeleton className="h-3 w-24 bg-white/10" />
        <div className="flex items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-32 bg-white/10" />
            <Skeleton className="h-4 w-72 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-36 rounded-full bg-white/10" />
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-[4px] border border-line bg-surface p-4"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-start justify-between border-t border-line pt-5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-32" />
      </section>
    </div>
  );
}
