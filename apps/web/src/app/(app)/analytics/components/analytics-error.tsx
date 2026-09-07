import { RefreshCw } from "lucide-react";
import StyledLink from "@/components/styled-link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api/error";

export function AnalyticsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  if (error instanceof ApiError && error.status === 401) return <Card><CardHeader><CardTitle>Sign in to view analytics</CardTitle><CardDescription>Your training performance is available after signing in.</CardDescription></CardHeader><CardContent><Tooltip><TooltipTrigger render={<span className="inline-flex" />}><StyledLink href="/sign-in?callbackURL=%2Fanalytics">Sign in</StyledLink></TooltipTrigger><TooltipContent>Sign in to view your analytics</TooltipContent></Tooltip></CardContent></Card>;
  const detail = error instanceof ApiError && error.status === 400 ? error.message : "Check your connection and try again.";
  return <Alert variant="destructive"><RefreshCw /><AlertTitle>Analytics could not be loaded</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-2"><span>{detail}</span><Tooltip><TooltipTrigger render={<Button variant="outline" onClick={onRetry}>Retry</Button>} /><TooltipContent>Retry loading analytics</TooltipContent></Tooltip></AlertDescription></Alert>;
}
