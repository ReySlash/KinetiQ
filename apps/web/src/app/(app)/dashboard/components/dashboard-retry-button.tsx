"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardRetryButton() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="outline" onClick={() => router.refresh()}>
            <RefreshCw data-icon="inline-start" />
            Retry
          </Button>
        }
      />
      <TooltipContent>Retry loading your training plan</TooltipContent>
    </Tooltip>
  );
}
