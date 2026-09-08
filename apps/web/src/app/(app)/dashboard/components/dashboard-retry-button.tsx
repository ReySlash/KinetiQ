"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DashboardRetryButton() {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.refresh()}>
      <RefreshCw data-icon="inline-start" />
      Retry
    </Button>
  );
}
