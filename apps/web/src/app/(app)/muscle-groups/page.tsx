import { PageHeader } from "@/components/page-header";
import { fetchMuscleGroups } from "@/lib/muscle-groups-server";
import { MuscleGroupsTable } from "./components/muscle-groups-table";
import { RateLimitedState } from "@/components/rate-limited-state";
import { isRateLimitedResult } from "@/lib/api/error";

export const dynamic = "force-dynamic";

export default async function MusclesPage() {
  const muscleGroups = await fetchMuscleGroups();
  if (isRateLimitedResult(muscleGroups)) {
    return <RateLimitedState title="Muscle groups are temporarily unavailable" description="Too many requests were made. Please wait a moment and try again." />;
  }
  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore each muscle group's function and anatomy.">
        <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
      </PageHeader>

      <section className="flex-1 min-h-0 rounded-xl border border-border/70 bg-card/80 p-2 shadow-sm md:rounded-3xl md:p-3 overflow-auto">
        <MuscleGroupsTable muscleGroups={muscleGroups} />
      </section>
    </main>
  );
}
