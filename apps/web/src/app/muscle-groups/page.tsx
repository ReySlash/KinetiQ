import { buildUrl } from "@/lib/url";
import { PageHeader } from "@/components/page-header";
import { MuscleGroup } from "@/types/muscle-types";
import { MuscleGroupsTable } from "./components/muscle-groups-table";

async function fetchData(url: string): Promise<MuscleGroup[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch muscles: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export default async function MusclesPage() {
  const muscleGroups = await fetchData(
    buildUrl(process.env.API_URL, "muscle-groups"),
  );
  return (
    <main className="flex h-dvh w-full flex-col gap-2 p-1 md:p-2">
      <PageHeader subtitle="Explore each muscle group&apos;s function and anatomy.">
        <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
      </PageHeader>

      <section className="flex-1 min-h-0 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3 overflow-auto">
        <MuscleGroupsTable muscleGroups={muscleGroups} />
      </section>
    </main>
  );
}
