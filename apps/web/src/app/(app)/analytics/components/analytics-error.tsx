"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AnalyticsError({ status, message }: { status: number; message: string }) {
  const router = useRouter();
  if (status === 401) {
    return (
      <Card className="flex min-h-0 flex-1 items-center justify-center border border-border/70 bg-card/80 shadow-sm">
        <CardContent className="flex max-w-md flex-col items-center gap-3 p-8 text-center">
          <CardTitle>Sign in to view analytics</CardTitle>
          <CardDescription>
            Your training performance is available after signing in.
          </CardDescription>
          <StyledLink href="/sign-in?callbackURL=%2Fanalytics" size="lg">
            Sign in
          </StyledLink>
        </CardContent>
      </Card>
    );
  }
  const detail =
    status === 429
      ? "Too many requests were made. Please wait a moment and try again."
      : status === 400
        ? message
        : "Check your connection and try again.";
  return <Alert variant="destructive"><RefreshCw /><AlertTitle>Analytics could not be loaded</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-2"><span>{detail}</span><Tooltip><TooltipTrigger render={<Button variant="outline" onClick={() => router.refresh()}>Retry</Button>} /><TooltipContent>Retry loading analytics</TooltipContent></Tooltip></AlertDescription></Alert>;
}
