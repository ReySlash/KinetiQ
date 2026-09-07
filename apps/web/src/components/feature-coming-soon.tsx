"use client";

import { ArrowLeft, CalendarDays, ChartNoAxesCombined } from "lucide-react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FeatureComingSoonProps = {
  title: string;
  subtitle: string;
  description: string;
  icon: "calendar" | "progress";
};

const icons = {
  calendar: CalendarDays,
  progress: ChartNoAxesCombined,
};

export function FeatureComingSoon({
  title,
  subtitle,
  description,
  icon,
}: FeatureComingSoonProps) {
  const router = useRouter();
  const Icon = icons[icon];

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle={subtitle}>
        <h1 className="text-lg leading-none font-bold">{title}</h1>
      </PageHeader>

      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-card/70 p-4 shadow-sm md:rounded-2xl md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <Card className="relative w-full max-w-xl overflow-hidden border-primary/15 bg-background/80 shadow-xl shadow-primary/5 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center px-6 py-10 text-center md:px-12 md:py-14">
            <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner shadow-primary/10">
              <Icon className="size-8" aria-hidden="true" />
            </div>
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              Coming soon
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {title} is on the way
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
            <Button className="mt-8" variant="outline" onClick={goBack}>
              <ArrowLeft data-icon="inline-start" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
