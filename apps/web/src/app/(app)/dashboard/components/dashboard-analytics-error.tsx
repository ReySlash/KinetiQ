"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export function DashboardAnalyticsError({ status }: { status: number }) {
  const router = useRouter();
  return (
    <Alert variant="destructive">
      <RefreshCw />
      <AlertTitle>Training summary is unavailable</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>
          {status === 429
            ? "Too many requests were made. Please wait a moment and try again."
            : "We could not load your recent training metrics."}
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" onClick={() => router.refresh()}>
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
