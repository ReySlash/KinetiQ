import { getLocalImageSrc } from "@/lib/local-image";
import { fetchExercise } from "@/lib/exercises-server";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// import StatsCard from "../components/stats-card";
import StatsBarChart from "../components/stats-bar-chart";
import OverviewCard from "../components/overview-card";

import HeroCard from "../../../../components/hero-card";
import MuscleSCard from "@/components/muscles-card";
import { AddToRoutineDialog } from "@/components/add-to-routine-dialog";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const exerciseDetails = await fetchExercise(slug);

  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore our exercise's catalog.">
        <Link
          className="inline-flex items-center gap-1 text-lg leading-none font-bold text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
          href="/exercises"
        >
          <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
          Exercises
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          <ChevronRight
            className="size-4 shrink-0 self-center text-muted-foreground"
            aria-hidden="true"
          />
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
              thumbnailUrl={
                exerciseDetails.thumbnailUrl ??
                getLocalImageSrc("exercises", exerciseDetails.slug)
              }
              imageAltText={exerciseDetails.imageAltText}
              fallbackSrc="/empty-state-exercises.webp"
            />

            <StatsBarChart
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
            thumbnailUrl={
              exerciseDetails.thumbnailUrl ??
              getLocalImageSrc("exercises", exerciseDetails.slug)
            }
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
          <StatsBarChart
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
