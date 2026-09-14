"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function RateLimitedState({
  title = "Too many requests",
  description = "Please wait a moment before trying again.",
}: {
  title?: string;
  description?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button onClick={() => router.refresh()}>
        <RefreshCw aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
