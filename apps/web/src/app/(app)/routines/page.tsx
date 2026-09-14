import { RoutinesLibrary } from "./components/routines-library";
import { PageHeader } from "@/components/page-header";
import { fetchRoutines } from "@/lib/routines-server";
import { RoutinesTabs } from "./components/routines-tabs";
import SignedOutState from "@/components/signed-out-state";

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
          <SignedOutState
            title="Sign in to see your routines"
            description="Routines are private workout templates saved to your account. Sign in to create and manage them."
            tooltip="Sign in to see your routines"
            page="routines"
          />
        ) : (
          <RoutinesLibrary routines={result.routines} scope={scope} />
        )}
      </RoutinesTabs>
    </main>
  );
}
