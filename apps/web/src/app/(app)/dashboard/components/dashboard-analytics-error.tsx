"use client";

import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DashboardAnalyticsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <RefreshCw />
      <AlertTitle>Training summary is unavailable</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>We could not load your recent training metrics.</span>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
