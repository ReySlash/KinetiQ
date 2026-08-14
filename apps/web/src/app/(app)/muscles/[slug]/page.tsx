import { buildApiUrl } from "@/lib/url";
import { Muscle } from "@/types/muscle-types";
import ImageWithFallback from "@/components/image-with-fallback";
import { Card, CardContent } from "@/components/ui/card";
import { MuscleBreadcrumb } from "@/app/(app)/muscle-groups/components/muscle-breadcrumb";
import { PageHeader } from "@/components/page-header";
import MuscleOverviewCard from "./components/muscle-overview-card";
import ExercisesMusclesCard from "./components/exercises-muscles-card";
import { getLocalImageSrc } from "@/lib/local-image";

export const dynamic = "force-dynamic";

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
    buildApiUrl(`muscles/${slug}`),
  );

  return (
    <main className="flex h-dvh w-full flex-col gap-2 overflow-hidden px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore each muscle group&apos;s function and anatomy.">
        <MuscleBreadcrumb
          muscleGroup={muscleDetails.muscleGroup?.name}
          muscleGroupSlug={muscleDetails.muscleGroup?.slug}
        />
        <span className="text-lg leading-none text-muted-foreground">
          {" > "}
        </span>
        <h1 className="text-lg font-bold leading-none">{muscleDetails.name}</h1>
      </PageHeader>
      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2 justify-center rounded-3xl lg:grid-cols-2">
          <Card className="p-2 col-span-1 w-full aspect-square">
            <CardContent className="relative h-full aspect-square">
              <ImageWithFallback
                src={
                  muscleDetails.thumbnailUrl ??
                  getLocalImageSrc("muscles", muscleDetails.slug)
                }
                alt={muscleDetails.imageAltText ?? "Event cover"}
                className="z-20 object-cover rounded-3xl"
                fill
                fallbackSrc="/empty-state-muscles.webp"
              />
            </CardContent>
          </Card>
          <div className="flex flex-col gap-2">
            <MuscleOverviewCard muscleDetails={muscleDetails} />
            {muscleDetails.exerciseMuscles.length > 0 && (
              <ExercisesMusclesCard exercises={muscleDetails.exerciseMuscles} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
