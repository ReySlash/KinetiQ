import StyledLink from "@/components/styled-link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function AnalyticsUnauthenticatedState() {
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
