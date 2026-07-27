import { SidebarTrigger } from "@/components/ui/sidebar";
import { buildUrl } from "@/lib/url";
import { Muscle } from "@/types/muscle-types";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MuscleBreadcrumb } from "@/app/muscle-groups/components/muscle-breadcrumb";
import MuscleOverviewCard from "./components/muscle-overview-card";
import ExercisesMusclesCard from "./components/exercises-muscles-card";

async function fetchData(url: string): Promise<Muscle> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch muscle group: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export default async function MuscleGroupPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const muscleDetails = await fetchData(
    buildUrl(process.env.API_URL, `muscles/${slug}`),
  );

  return (
    <main className=" h-full w-full flex flex-col gap-2 p-1 md:p-2">
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <SidebarTrigger />
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
            <MuscleBreadcrumb
              muscleGroup={muscleDetails.muscleGroup?.name}
              muscleGroupSlug={muscleDetails.muscleGroup?.slug}
            />
            <span className="text-lg leading-none text-muted-foreground">
              {" > "}
            </span>
            <h1 className="text-lg font-bold leading-none">
              {muscleDetails.name}
            </h1>
          </div>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl">
        <Card className="p-2 col-span-1 w-full aspect-square">
          <CardContent className="relative h-full aspect-square">
            <Image
              src={
                muscleDetails.thumbnailUrl ?? "https://avatar.vercel.sh/shadcn1"
              }
              alt={muscleDetails.imageAltText ?? "Event cover"}
              className="z-20 object-cover rounded-3xl"
              fill
            />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <MuscleOverviewCard muscleDetails={muscleDetails} />
          {muscleDetails.exerciseMuscles.length > 0 && (
            <ExercisesMusclesCard exercises={muscleDetails.exerciseMuscles} />
          )}
        </div>
      </section>
    </main>
  );
}
