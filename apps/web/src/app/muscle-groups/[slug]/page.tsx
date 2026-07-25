import { SidebarTrigger } from "@/components/ui/sidebar";
import { Muscle } from "@/types/muscle-types";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MuscleGroupDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailStorageKey: string | null;
  imageAltText: string | null;
  bodyRegion: string;
  muscles: Muscle[];
};

async function fetchData(url: string): Promise<MuscleGroupDetails> {
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

  const muscleGroupDetails = await fetchData(
    `http://localhost:3001/api/muscle-groups/${slug}`,
  );

  return (
    <main className=" h-full w-full flex flex-col gap-2 p-1 md:p-2">
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
      <section className="@container grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3">
        <Card className="sm:col-span-2 lg:col-span-1 relative w-full aspect-square max-h-[85vh]">
          <Image
            src={
              muscleGroupDetails.thumbnailUrl ??
              "https://avatar.vercel.sh/shadcn1"
            }
            alt={muscleGroupDetails.imageAltText ?? "Event cover"}
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            fill
          />
        </Card>
        <div className="flex flex-col gap-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold leading-none mb-1">
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <CardDescription className="col-span-2">
                {muscleGroupDetails.description}
              </CardDescription>
              <div className="flex flex-col gap-3 text-lg text-muted-foreground leading-none col-span-1">
                <p>Group</p>
                <p>Body Region</p>
                <p>Number of muscles</p>
              </div>
              <div className="flex flex-col gap-3 text-lg leading-none text-muted-foreground col-span-1">
                <p>- {muscleGroupDetails.name}</p>
                <p>- {muscleGroupDetails.bodyRegion.replace("_", " ")}</p>

                <p>- {muscleGroupDetails.muscles.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold leading-none mb-1">
                Muscles in this group
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-muted-foreground leading-none mb-1">
              {muscleGroupDetails.muscles.map((muscle) => (
                <div
                  className="border-t p-3 flex items-center justify-between"
                  key={muscle.id}
                >
                  <p>{muscle.name}</p>
                  <Link
                    className="bg-primary text-primary-foreground hover:bg-primary/80 text-center rounded-sm py-1 p-2"
                    href={`/muscles/${muscle.slug}`}
                  >
                    Details
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
