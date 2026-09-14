"use client";

import { RefreshCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api/error";

export function DashboardAnalyticsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <RefreshCw />
      <AlertTitle>Training summary is unavailable</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>
          {error instanceof ApiError && error.status === 429
            ? "Too many requests were made. Please wait a moment and try again."
            : "We could not load your recent training metrics."}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" onClick={onRetry}>
                Retry
              </Button>
            }
          />
          <TooltipContent>Retry loading dashboard analytics</TooltipContent>
        </Tooltip>
      </AlertDescription>
    </Alert>
  );
}
