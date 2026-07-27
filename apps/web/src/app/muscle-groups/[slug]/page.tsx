import { SidebarTrigger } from "@/components/ui/sidebar";
import { MuscleGroupDetails } from "@/types/muscle-types";
import { buildUrl } from "@/lib/url";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import MuscleGroupOverviewCard from "../muscle-group-overview-card";
import MusclesIncludedTable from "../components/muscle-included-table";

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
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60">
        <SidebarTrigger />
        <div className="flex flex-col">
          <div className="flex flex-row gap-2">
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
                muscleGroupDetails.thumbnailUrl ??
                "https://avatar.vercel.sh/shadcn1"
              }
              alt={
                muscleGroupDetails.imageAltText ??
                "Not image description found."
              }
              className="z-20 object-cover rounded-3xl"
              fill
            />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <MuscleGroupOverviewCard muscleGroupDetails={muscleGroupDetails} />

          <MusclesIncludedTable muscleGroupDetails={muscleGroupDetails} />
        </div>
      </section>
    </main>
  );
}
