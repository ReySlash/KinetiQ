"use client";

import { ServiceUnavailableState } from "@/components/service-unavailable-state";

export default function GlobalError({ reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark min-h-full antialiased">
      <body className="min-h-dvh bg-background text-foreground">
        <main className="flex min-h-dvh w-full items-center justify-center p-4">
          <section className="w-full max-w-2xl rounded-2xl border border-border/70 bg-card/80 shadow-sm">
            <ServiceUnavailableState
              title="Something went wrong"
              description="We could not load the application right now. Please try again in a moment."
              onRetry={reset}
            />
          </section>
        </main>
      </body>
    </html>
  );
}
