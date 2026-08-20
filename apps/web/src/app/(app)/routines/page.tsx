import { RoutinesLibrary } from "./components/routines-library";
import { PageHeader } from "@/components/page-header";
import { fetchRoutines } from "@/lib/routines-server";
import StyledLink from "@/components/styled-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { RoutinesTabs } from "./components/routines-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Routines | KinetiQ",
  description: "Build and manage your private workout routines.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const scope = params.scope === "global" ? "global" : "my";
  const result = await fetchRoutines({ q, sort, scope });

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Reusable workout templates for your training.">
        <h1 className="text-lg font-bold leading-none">Routines</h1>
      </PageHeader>
      <RoutinesTabs scope={scope}>
        {result.status === "unauthenticated" ? (
          <Card className="flex min-h-0 flex-1 items-center justify-center border border-border/70 bg-card/80 shadow-sm">
            <CardContent className="flex max-w-md flex-col items-center gap-3 p-8 text-center">
              <CardTitle>Sign in to view your routines</CardTitle>
              <CardDescription>
                Routines are private workout templates saved to your account.
                Sign in to create and manage them.
              </CardDescription>
              <StyledLink
                href={`/sign-in?callbackURL=${encodeURIComponent("/routines")}`}
                size="lg"
              >
                Sign in
              </StyledLink>
            </CardContent>
          </Card>
        ) : (
          <RoutinesLibrary routines={result.routines} scope={scope} />
        )}
      </RoutinesTabs>
    </main>
  );
}
