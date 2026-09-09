import { Card, CardContent } from "@/components/ui/card";
import StyledLink from "@/components/styled-link";
import type { RoutineListItem } from "@/types/routine-types";

export function RoutineChoice({
  routine,
  exerciseSlug,
}: {
  routine: RoutineListItem;
  exerciseSlug: string;
}) {
  return (
    <Card className="transition-colors hover:border-primary/50">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{routine.name}</p>
          <p className="text-xs text-muted-foreground">
            {routine.exerciseCount}{" "}
            {routine.exerciseCount === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <StyledLink
          href={`/routines/${routine.slug}/edit?exerciseSlug=${encodeURIComponent(exerciseSlug)}`}
          size="sm"
        >
          Open builder
        </StyledLink>
      </CardContent>
    </Card>
  );
}
