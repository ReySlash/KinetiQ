"use client";

import { ServiceUnavailableState } from "@/components/service-unavailable-state";

export default function Error({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex h-dvh w-full items-center justify-center bg-background p-4 text-foreground">
      <section className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card/80 shadow-sm">
        <ServiceUnavailableState
          title="Something went wrong"
          description="We could not load this page right now. Please try again in a moment."
          onRetry={reset}
        />
      </section>
    </main>
  );
}
