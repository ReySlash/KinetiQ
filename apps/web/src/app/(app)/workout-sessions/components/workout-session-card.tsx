import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutSessionListItem } from "@/types/workout-session-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function WorkoutSessionCard({ session }: { session: WorkoutSessionListItem }) {
  const statusLabel = session.status === "IN_PROGRESS" ? "In progress" : session.status.toLowerCase();
  return (
    <Link href={`/workout-sessions/${session.id}`} className="rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div><CardTitle>{session.sourceRoutineNameSnapshot ?? "Freestyle workout"}</CardTitle><CardDescription>{formatDate(session.startedAt)}</CardDescription></div>
            <Badge variant={session.status === "COMPLETED" ? "secondary" : session.status === "IN_PROGRESS" ? "default" : "outline"}>{statusLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex justify-between text-sm text-muted-foreground"><span>{session.completedSetCount} sets</span><span>{session.completedAt ? formatDate(session.completedAt) : "Continue workout"}</span></CardContent>
      </Card>
    </Link>
  );
}
