import { buildApiUrl } from "@/lib/url";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ExerciseDetails } from "@/types/exercise-types";

import StatsCard from "../components/stats-card";
import OverviewCard from "../components/overview-card";

import HeroCard from "../../../../components/hero-card";
import MuscleSCard from "@/components/muscles-card";
import { AddToRoutineDialog } from "@/components/add-to-routine-dialog";

export const dynamic = "force-dynamic";

async function fetchData(url: string): Promise<ExerciseDetails> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch exercises: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export default async function ExerciseDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const exerciseDetails = await fetchData(buildApiUrl(`exercises/${slug}`));

  return (
    <main className="flex h-dvh w-full flex-col gap-2 overflow-hidden px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore our exercise's catalog.">
        <Link
          className="text-lg leading-none font-bold not-hover:text-muted-foreground transition-colors duration-200"
          href="/exercises"
        >
          Exercises
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          {" > "}
        </span>
        <h1 className="text-lg font-bold leading-none">
          {exerciseDetails.name}
        </h1>
      </PageHeader>

      <section className="min-h-0 flex-1 overflow-y-auto space-y-2 rounded-2xl">
        {/* Desktop View */}

        <div className="hidden flex-row gap-2 rounded-3xl lg:flex">
          <div className="flex w-1/2 flex-col gap-2">
            <HeroCard
              thumbnailUrl={exerciseDetails.thumbnailUrl}
              imageAltText={exerciseDetails.imageAltText}
              fallbackSrc="/empty-state-exercises.webp"
            />

            <StatsCard
              capabilities={
                exerciseDetails.capabilities
                  ? Object.values(exerciseDetails.capabilities)
                  : []
              }
              demands={
                exerciseDetails.demands
                  ? Object.values(exerciseDetails.demands)
                  : []
              }
            />
          </div>
          <div className="flex w-1/2 flex-col gap-2">
            <OverviewCard
              exerciseDetails={exerciseDetails}
              actions={
                <AddToRoutineDialog
                  exerciseSlug={exerciseDetails.slug}
                  exerciseName={exerciseDetails.name}
                  triggerSize="sm"
                />
              }
            />
            <MuscleSCard muscles={exerciseDetails.muscles} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col gap-2 rounded-3xl lg:hidden">
          <HeroCard
            thumbnailUrl={exerciseDetails.thumbnailUrl}
            imageAltText={exerciseDetails.imageAltText}
            fallbackSrc="/empty-state-exercises.webp"
          />

          <OverviewCard
            exerciseDetails={exerciseDetails}
            actions={
              <AddToRoutineDialog
                exerciseSlug={exerciseDetails.slug}
                exerciseName={exerciseDetails.name}
              />
            }
          />
          <StatsCard
            capabilities={
              exerciseDetails.capabilities
                ? Object.values(exerciseDetails.capabilities)
                : []
            }
            demands={
              exerciseDetails.demands
                ? Object.values(exerciseDetails.demands)
                : []
            }
          />

          <MuscleSCard muscles={exerciseDetails.muscles} />
        </div>
      </section>
    </main>
  );
}
