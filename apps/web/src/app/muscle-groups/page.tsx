import { MuscleCard } from "@/app/muscle-groups/components/muscle-card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MuscleGroup } from "@/types/muscle-types";

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
    "http://localhost:3001/api/muscle-groups",
  );

  return (
    <main className="h-full w-full flex flex-col gap-2 p-1 md:p-2">
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <section className="@container grid gap-2 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3 grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
        {muscleGroups.map((muscleGroup) => (
          <MuscleCard
            key={muscleGroup.id}
            imageUrl={muscleGroup.thumbnailUrl}
            imageAltText={muscleGroup.imageAltText}
            bodyRegion={"Muscle Group"}
            name={muscleGroup.name}
            slug={muscleGroup.slug}
          />
        ))}
      </section>
    </main>
  );
}
