import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default async function Loading() {
  return (
    <>
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
                <Skeleton className="h-4 w-2/3" />
              </h1>
            </div>
            <h2 className="text-xs text-muted-foreground">
              Explore each muscle group&apos;s function and anatomy.
            </h2>
          </div>
        </header>
        <section className="@container grid grid-cols-1 lg:grid-cols-2 gap-2 h-full justify-center rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3">
          <Card className="sm:col-span-2 lg:col-span-1 relative w-full aspect-square max-h-[85vh]">
            <Skeleton className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40" />
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
                  <Skeleton className="h-7 w-full" />
                </CardDescription>
                <div className="flex flex-col gap-3 text-lg text-muted-foreground leading-none col-span-1">
                  <p>Group</p>
                  <p>Body Region</p>
                  <p>Number of muscles</p>
                </div>
                <div className="flex flex-col gap-3 text-lg leading-none text-muted-foreground col-span-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold leading-none mb-1">
                  Muscles in this group
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 text-lg text-muted-foreground leading-none mb-1">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
