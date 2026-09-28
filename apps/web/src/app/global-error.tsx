"use client";

import { useEffect } from "react";
import { ServiceUnavailableState } from "@/components/service-unavailable-state";
import { captureWebException } from "@/lib/monitoring/capture";

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureWebException(error);
  }, [error]);

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
