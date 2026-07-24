"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  return (
    <>
      <header className="sticky top-0 z-100 bg-background flex h-14 items-center gap-3 border-b border-border/60 px-4">
        <SidebarTrigger />
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none">Muscle Groups</h1>
          <h2 className="text-xs text-muted-foreground">
            Explore each muscle group&apos;s function and anatomy.
          </h2>
        </div>
      </header>
      <main className="h-full w-full p-2 md:p-3">
        <section className="flex flex-col justify-center items-center gap-5 rounded-3xl border border-border/70 bg-card/80 shadow-sm h-full">
          <h2>Something went wrong!</h2>
          <Button
            variant="default"
            onClick={
              // Attempt to recover by re-fetching and re-rendering the segment
              () => unstable_retry()
            }
          >
            Try again
          </Button>
        </section>
      </main>
    </>
  );
}
