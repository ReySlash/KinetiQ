"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ServiceUnavailableState({
  title = "Service temporarily unavailable",
  description = "We could not load this page right now. Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const retry = onRetry ?? (() => router.refresh());

  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button onClick={retry}>
        <RefreshCw aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
