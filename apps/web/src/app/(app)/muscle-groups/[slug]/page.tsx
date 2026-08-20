import { MuscleGroupDetails } from "@/types/muscle-types";
import { buildApiUrl } from "@/lib/url";
import { getLocalImageSrc } from "@/lib/local-image";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import MuscleGroupOverviewCard from "../muscle-group-overview-card";
import HeroCard from "@/components/hero-card";
import MuscleSCard from "@/components/muscles-card";

export const dynamic = "force-dynamic";

async function fetchData(url: string): Promise<MuscleGroupDetails> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch muscle group: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

export default async function MuscleGroupDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const muscleGroupDetails = await fetchData(
    buildApiUrl(`muscle-groups/${slug}`),
  );

  return (
    <main className="flex h-dvh w-full flex-col gap-1 overflow-hidden px-0.5 pb-14 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore each muscle group's function and anatomy.">
        <Link
          className="text-lg leading-none font-bold not-hover:text-muted-foreground transition-colors duration-200"
          href="/muscle-groups"
        >
          Muscle Groups
        </Link>
        <span className="text-lg leading-none text-muted-foreground">
          {" > "}
        </span>
        <h1 className="text-lg font-bold leading-none">
          {muscleGroupDetails.name}
        </h1>
      </PageHeader>

      <section className="min-h-0 flex-1 overflow-y-auto">
        {/* Desktop View */}
        <div className="hidden flex-row gap-2 rounded-3xl lg:flex">
          <div className="flex w-1/2 flex-col gap-2">
            <HeroCard
              thumbnailUrl={
                muscleGroupDetails.thumbnailUrl ??
                getLocalImageSrc("muscle-groups", muscleGroupDetails.slug)
              }
              imageAltText={muscleGroupDetails.imageAltText}
              fallbackSrc="/empty-state-muscles.webp"
            />
          </div>
          <div className="flex w-1/2 flex-col gap-2">
            <MuscleGroupOverviewCard muscleGroupDetails={muscleGroupDetails} />
            <MuscleSCard muscles={muscleGroupDetails.muscles} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col gap-2 rounded-3xl lg:hidden">
          <HeroCard
            thumbnailUrl={
              muscleGroupDetails.thumbnailUrl ??
              getLocalImageSrc("muscle-groups", muscleGroupDetails.slug)
            }
            imageAltText={muscleGroupDetails.imageAltText}
            fallbackSrc="/empty-state-muscles.webp"
          />

          <MuscleGroupOverviewCard muscleGroupDetails={muscleGroupDetails} />
          <MuscleSCard muscles={muscleGroupDetails.muscles} />
        </div>
      </section>
    </main>
  );
}
