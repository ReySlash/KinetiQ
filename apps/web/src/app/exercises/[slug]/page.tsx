import { SidebarTrigger } from "@/components/ui/sidebar";
import { buildUrl } from "@/lib/url";
import Link from "next/link";
import { ExerciseDetails } from "@/types/exercise-types";

import StatsCard from "../components/stats-card";
import OverviewCard from "../components/overview-card";

import HeroCard from "../../../components/hero-card";
import MuscleSCard from "@/components/muscles-card";

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

  const exerciseDetails = await fetchData(
    buildUrl(process.env.API_URL, `exercises/${slug}`),
  );

  return (
    <main className="h-full w-full flex flex-col gap-2 p-1 md:p-2">
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <SidebarTrigger />
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
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
          </div>
          <h2 className="text-xs text-muted-foreground">
            Explore our exercise&apos;s catalog.
          </h2>
        </div>
      </header>

      {/* Desktop View */}
      <section className="hidden lg:flex flex-row gap-2 h-full justify-center rounded-3xl">
        <div className="flex flex-col gap-2 w-1/2">
          <HeroCard
            thumbnailUrl={exerciseDetails.thumbnailUrl}
            imageAltText={exerciseDetails.imageAltText}
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
        <div className="flex flex-col gap-2 w-1/2">
          <OverviewCard exerciseDetails={exerciseDetails} />
          <MuscleSCard muscles={exerciseDetails.muscles} />
        </div>
      </section>

      {/* Mobile View */}
      <section className="flex flex-col lg:hidden gap-2 h-full justify-center rounded-3xl">
        <HeroCard
          thumbnailUrl={exerciseDetails.thumbnailUrl}
          imageAltText={exerciseDetails.imageAltText}
        />

        <OverviewCard exerciseDetails={exerciseDetails} />
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
      </section>
    </main>
  );
}
