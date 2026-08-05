"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-2 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-lg font-bold leading-none">Routines</h1>
          <h2 className="text-xs text-muted-foreground">
            Reusable workout templates for your training.
          </h2>
        </div>
      </header>
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 rounded-2xl border border-border/70 bg-card/80 shadow-sm">
        <h2>Something went wrong!</h2>
        <Button onClick={reset}>Try again</Button>
      </section>
    </main>
  );
}
