import type { ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  Dumbbell,
  ListChecks,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const muscleData = [
  { label: "Quadriceps", value: 100 },
  { label: "Gluteus maximus", value: 85 },
  { label: "Adductors", value: 65 },
  { label: "Erector spinae", value: 45 },
] as const;

const exercises = ["Back squat", "Romanian deadlift", "Leg press", "Calf raise"] as const;

export function ExerciseIntelligencePreview() {
  return (
    <Card className="border border-border/80 bg-card/70 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Barbell Back Squat</CardTitle>
            <CardDescription>Compound · Lower body</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background/70">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_60%)]" />
          <div className="relative flex flex-col items-center text-center">
            <Activity className="size-20 text-primary/80" strokeWidth={1.2} aria-hidden="true" />
            <p className="mt-4 font-medium">Movement analysis</p>
            <p className="mt-1 max-w-48 text-xs leading-5 text-muted-foreground">
              Technique, mechanics, and training context in one view.
            </p>
          </div>
        </div>
        <div className="space-y-5 rounded-xl border border-border/70 bg-background/50 p-4">
          <div>
            <p className="text-sm font-medium">Primary muscles</p>
            <p className="mt-1 text-xs text-muted-foreground">Relative involvement</p>
          </div>
          <div className="space-y-4">
            {muscleData.map((muscle) => (
              <div key={muscle.label}>
                <div className="mb-1.5 flex justify-between gap-3 text-xs">
                  <span>{muscle.label}</span>
                  <span className="text-primary">{muscle.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${muscle.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="h-full border border-border/80 bg-card/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <span className="text-primary">{icon}</span>
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ProgrammingWorkflowPreview() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <WorkflowCard label="Exercise library" title="Choose movements" icon={<Dumbbell className="size-4" aria-hidden="true" />}>
        <ul className="space-y-2.5">
          {exercises.map((exercise) => (
            <li key={exercise} className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/45 px-2.5 py-2 text-xs">
              <span className="size-1.5 rounded-full bg-primary" />
              {exercise}
            </li>
          ))}
        </ul>
      </WorkflowCard>

      <WorkflowCard label="Routine" title="Lower body A" icon={<ListChecks className="size-4" aria-hidden="true" />}>
        <ul className="space-y-3 text-xs">
          {exercises.slice(0, 3).map((exercise, index) => (
            <li key={exercise} className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5 last:border-0">
              <span>{exercise}</span>
              <span className="text-muted-foreground">{index + 3} × {index + 6}–{index + 8}</span>
            </li>
          ))}
        </ul>
      </WorkflowCard>

      <WorkflowCard label="Training program" title="Strength foundation" icon={<CalendarDays className="size-4" aria-hidden="true" />}>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="flex aspect-square items-center justify-center rounded-md border border-border/60 bg-background/45">
              {index % 3 !== 2 ? <Check className="size-3 text-primary" aria-hidden="true" /> : <span className="size-1 rounded-full bg-muted-foreground/40" />}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">4 weeks · 3 sessions per week</p>
      </WorkflowCard>
    </div>
  );
}

export function ProgressPreview() {
  return (
    <Card className="border border-border/80 bg-card/70 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Progress overview</CardTitle>
            <CardDescription>Bench press · Six months</CardDescription>
          </div>
          <TrendingUp className="size-5 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[1fr_15rem]">
        <div className="rounded-xl border border-border/70 bg-background/50 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated 1RM</p>
              <p className="mt-1 text-2xl font-semibold">102.5 kg</p>
            </div>
            <p className="text-xs font-medium text-emerald-400">+6.2%</p>
          </div>
          <svg viewBox="0 0 640 220" role="img" aria-label="Upward six-month strength trend" className="mt-6 w-full">
            <defs>
              <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 190 L50 176 L90 182 L132 153 L175 162 L218 132 L260 143 L302 110 L345 118 L388 92 L430 101 L472 72 L515 79 L558 45 L600 54 L640 18 L640 220 L0 220 Z" fill="url(#progress-fill)" />
            <path d="M0 190 L50 176 L90 182 L132 153 L175 162 L218 132 L260 143 L302 110 L345 118 L388 92 L430 101 L472 72 L515 79 L558 45 L600 54 L640 18" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          {[
            ["Total volume", "24,580 kg", "+8.4%"],
            ["Workouts", "24", "+4"],
            ["Consistency", "92%", "+11%"],
          ].map(([label, value, change]) => (
            <div key={label} className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-emerald-400">{change}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
