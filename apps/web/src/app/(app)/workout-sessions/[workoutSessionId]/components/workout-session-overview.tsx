import { Play } from "lucide-react";
import Link from "next/link";
import { MoreLink } from "@/components/more-link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ImageWithFallback from "@/components/image-with-fallback";
import { getLocalImageSrc } from "@/lib/local-image";
import { cn } from "@/lib/utils";
import type { WorkoutSession } from "@/types/workout-session-types";
import { WorkoutProgramLink } from "../../components/workout-program-context";

function exerciseSlugFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function WorkoutSessionOverview({
  session,
}: {
  session: WorkoutSession;
}) {
  return (
    <div className="grid gap-1">
      <div className="grid gap-1 px-1">
        <WorkoutProgramLink
          provenance={session.provenance}
          className="truncate text-xl font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        />
        <p className="text-sm text-muted-foreground">
          Start an exercise when you are ready to record each set.
        </p>
      </div>
      <div className="grid gap-2">
        {session.performances.map((performance) => {
          const completed = performance.completedSets.length;
          const total = performance.targetSetCount;
          const isStarted = completed > 0;
          const isActive = total !== null && completed > 0 && completed < total;
          return (
            <Card
              key={performance.id}
              className="border-border/70 bg-card/80 p-1"
            >
              <CardContent className="flex flex-row justify-between items-center px-0">
                <ImageWithFallback
                  className="size-16 rounded-xl border border-border/70 object-cover sm:size-20"
                  src={getLocalImageSrc(
                    "exercises",
                    exerciseSlugFromName(performance.exerciseNameSnapshot),
                  )}
                  alt={`${performance.exerciseNameSnapshot} thumbnail`}
                  width={160}
                  height={120}
                  fallbackSrc="/assets/empty-state-exercises.webp"
                />
                <div className="min-w-0 text-center">
                  <h3 className="truncate text-base font-semibold sm:text-lg">
                    {performance.exerciseNameSnapshot}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {completed}/{total ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/workout-sessions/${session.id}/exercises/${performance.id}`}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "icon",
                            }),
                            "size-10 rounded-lg",
                            isActive &&
                              "border-primary! text-primary hover:bg-primary! hover:text-black!",
                          )}
                        />
                      }
                    >
                      <Play aria-hidden="true" />
                      <span className="sr-only">
                        {isStarted ? "Continue" : "Start"}{" "}
                        {performance.exerciseNameSnapshot}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isStarted ? "Continue" : "Start"}{" "}
                      {performance.exerciseNameSnapshot}
                    </TooltipContent>
                  </Tooltip>
                  <MoreLink
                    href={`/exercises/${exerciseSlugFromName(performance.exerciseNameSnapshot)}`}
                    tooltip={`View ${performance.exerciseNameSnapshot} details`}
                    ariaLabel={`View ${performance.exerciseNameSnapshot} details`}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
