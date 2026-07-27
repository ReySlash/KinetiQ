import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { buildUrl } from "@/lib/url";
import Link from "next/link";
import Image from "next/image";
import { ExerciseDetails } from "@/types/exercise-types";

import StatsCard from "../components/stats-card";
import OverviewCard from "../components/overview-card";
import MuscleSInvolvedCard from "../components/muscles-involved-card";

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
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl">
        <Card className="p-2 col-span-1 w-full aspect-square">
          <CardContent className="relative h-full aspect-square">
            <Image
              src={
                exerciseDetails.thumbnailUrl ??
                "https://avatar.vercel.sh/shadcn1"
              }
              alt={
                exerciseDetails.imageAltText ?? "Not image description found."
              }
              className="z-20 object-cover rounded-3xl"
              fill
            />
          </CardContent>
        </Card>

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

        <MuscleSInvolvedCard exerciseDetails={exerciseDetails} />
      </section>
    </main>
  );
}
