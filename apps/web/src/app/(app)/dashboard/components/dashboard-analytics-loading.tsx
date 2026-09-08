import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAnalyticsLoading({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2" aria-label="Loading training summary">
      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-52" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>
      {children}
      <Skeleton className="h-52 rounded-xl" />
    </div>
  );
}
