import { LogIn } from "lucide-react";

import StyledLink from "@/components/styled-link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardSignedOutState() {
  return (
    <Empty className="min-h-80 border border-dashed bg-card/50">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LogIn aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Sign in to see your training dashboard</EmptyTitle>
        <EmptyDescription>
          Your active workouts, programs, and training history are private to
          your account.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <StyledLink href="/sign-in?callbackURL=%2Fdashboard" size="lg">
              Sign in
            </StyledLink>
          </TooltipTrigger>
          <TooltipContent>Sign in to open your dashboard</TooltipContent>
        </Tooltip>
      </EmptyContent>
    </Empty>
  );
}
