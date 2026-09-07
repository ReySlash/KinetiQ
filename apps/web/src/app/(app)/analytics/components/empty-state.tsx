import { BarChart3 } from "lucide-react";
import StyledLink from "@/components/styled-link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export function EmptyState() {
  return <Empty className="min-h-72 border border-dashed bg-card/50"><EmptyHeader><EmptyMedia variant="icon"><BarChart3 /></EmptyMedia><EmptyTitle>No completed workouts yet</EmptyTitle><EmptyDescription>Only completed workouts contribute to analytics. Complete a session to begin building your performance history.</EmptyDescription></EmptyHeader><EmptyContent><Tooltip><TooltipTrigger render={<span className="inline-flex" />}><StyledLink href="/workout-sessions">View or start workouts</StyledLink></TooltipTrigger><TooltipContent>Open your workout sessions</TooltipContent></Tooltip></EmptyContent></Empty>;
}
