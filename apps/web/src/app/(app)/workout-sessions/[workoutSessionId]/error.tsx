"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return <main className="flex h-dvh w-full flex-col items-center justify-center gap-4 px-4 pb-13 text-center"><div><h1 className="font-semibold">Workout session is unavailable</h1><p className="mt-1 text-sm text-muted-foreground">Try again when the service is running.</p></div><Button onClick={reset}>Try again</Button></main>;
}
