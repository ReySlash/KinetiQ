import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutSession } from "@/types/workout-session-types";

export function WorkoutSessionSummary({ session }: { session: WorkoutSession }) {
  const completedSets = session.performances.reduce((total, performance) => total + performance.completedSets.length, 0);
  const isCompleted = session.status === "COMPLETED";
  return (
    <div className="mx-auto grid max-w-3xl gap-3 p-2 md:p-4">
      <Card className="border-border/70 bg-card/80"><CardHeader className="items-center text-center"><div className="rounded-full border border-primary p-3 text-primary">{isCompleted ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}</div><CardTitle>{isCompleted ? "Great work!" : "Workout cancelled"}</CardTitle><CardDescription>{session.sourceRoutineNameSnapshot ?? "Freestyle workout"}</CardDescription></CardHeader><CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-border/70 p-3"><p className="text-xs text-muted-foreground">Exercises</p><p className="mt-1 text-xl font-semibold">{session.performances.length}</p></div><div className="rounded-xl border border-border/70 p-3"><p className="text-xs text-muted-foreground">Sets</p><p className="mt-1 text-xl font-semibold">{completedSets}</p></div><div className="rounded-xl border border-border/70 p-3"><p className="text-xs text-muted-foreground">Started</p><p className="mt-1 text-sm font-medium">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(session.startedAt))}</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Exercises</CardTitle><CardDescription>Historical prescription and completed sets.</CardDescription></CardHeader><CardContent className="grid gap-2">{session.performances.map((performance) => <div key={performance.id} className="rounded-xl border border-border/70 p-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">{performance.exerciseNameSnapshot}</p><span className="text-sm text-muted-foreground">{performance.completedSets.length} sets</span></div></div>)}</CardContent></Card>
    </div>
  );
}
