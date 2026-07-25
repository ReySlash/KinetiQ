import { SidebarTrigger } from "@/components/ui/sidebar";
import { Muscle } from "@/types/muscle-types";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MuscleBreadcrumb } from "@/app/muscle-groups/components/muscle-breadcrumb";

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
    `http://localhost:3001/api/muscles/${slug}`,
  );

  const secondaryFunctions: string[] = muscleDetails.functionAssignments
    .filter((fa) => fa.role === "SECONDARY")
    .map((fa) => fa.muscleFunction.name);

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
      <section className="@container grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3">
        <Card className="sm:col-span-2 lg:col-span-1 relative w-full aspect-square max-h-[85vh]">
          <Image
            src={
              muscleDetails.thumbnailUrl ?? "https://avatar.vercel.sh/shadcn1"
            }
            alt={muscleDetails.imageAltText ?? "Event cover"}
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
                {muscleDetails.description}
              </CardDescription>
              <div className="flex flex-col gap-3 text-lg text-muted-foreground leading-none col-span-1">
                <p>Muscle Name</p>
                <p>Muscle Group</p>
                <p>Body Region</p>
                <p>Primary Function</p>
                <p>Secondary Function</p>
                <p>Exercises</p>
              </div>
              <div className="flex flex-col gap-3 text-lg leading-none text-muted-foreground col-span-1">
                <p>- {muscleDetails.name}</p>
                <p>- {muscleDetails.muscleGroup?.name ?? "N/A"}</p>
                <p>- {muscleDetails.bodyRegion.replace("_", " ")}</p>
                <p>
                  -{" "}
                  {
                    muscleDetails.functionAssignments.find(
                      (fa) => fa.role === "PRIMARY",
                    )?.muscleFunction.name
                  }
                </p>
                <div>
                  {secondaryFunctions.length > 0
                    ? secondaryFunctions.map((func, id) => (
                        <p key={id}>- {func}</p>
                      ))
                    : "- N/A"}
                </div>
                <p>- placeholder -</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
