import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ExerciseDetailsPage() {
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
          </div>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl">
        <Card className="p-2 col-span-1 w-full aspect-square">
          <CardContent className="relative h-full aspect-square">
            <Skeleton className="w-full aspect-square" />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-2">
          <Card className="flex flex-col gap-6">
            <CardHeader>
              <Skeleton className="w-1/3 h-8" />
              <Skeleton className="w-1/2 h-10" />
              <Skeleton className="w-full h-20" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
            </CardContent>
          </Card>

          <Card className="flex flex-col gap-6">
            <CardHeader className="flex flex-row justify-between">
              <Skeleton className="w-1/3 h-6" />
              <Skeleton className="w-1/3 h-6" />
              <Skeleton className="w-1/3 h-6" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
              <Skeleton className="w-full h-8" />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
