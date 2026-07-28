import { MuscleGroupDetails } from "@/types/muscle-types";
import { buildUrl } from "@/lib/url";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import MuscleGroupOverviewCard from "../muscle-group-overview-card";
import HeroCard from "@/components/hero-card";
import MuscleSCard from "@/components/muscles-card";

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
    buildUrl(process.env.API_URL, `muscle-groups/${slug}`),
  );

  return (
    <main className="h-full w-full flex flex-col gap-2 p-1 md:p-2">
      <PageHeader
        sticky
        subtitle="Explore each muscle group&apos;s function and anatomy."
      >
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

      {/* Desktop View */}
      <section className="hidden lg:flex flex-row gap-2 h-full justify-center rounded-3xl">
        <div className="flex flex-col gap-2 w-1/2">
          <HeroCard
            thumbnailUrl={muscleGroupDetails.thumbnailUrl}
            imageAltText={muscleGroupDetails.imageAltText}
          />
        </div>
        <div className="flex flex-col gap-2 w-1/2">
          <MuscleGroupOverviewCard muscleGroupDetails={muscleGroupDetails} />
          <MuscleSCard muscles={muscleGroupDetails.muscles} />
        </div>
      </section>

      {/* Mobile View */}
      <section className="flex flex-col lg:hidden gap-2 h-full justify-center rounded-3xl">
        <HeroCard
          thumbnailUrl={muscleGroupDetails.thumbnailUrl}
          imageAltText={muscleGroupDetails.imageAltText}
        />

        <MuscleGroupOverviewCard muscleGroupDetails={muscleGroupDetails} />
        <MuscleSCard muscles={muscleGroupDetails.muscles} />
      </section>
    </main>
  );
}
