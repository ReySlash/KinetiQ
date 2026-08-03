import { RoutinesLibrary } from "./components/routines-library";
import { PageHeader } from "@/components/page-header";
import { fetchRoutines } from "@/lib/routines-server";

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
  const routines = await fetchRoutines({ q, sort });

  return (
    <main className="flex h-dvh w-full flex-col gap-2 px-1 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Reusable workout templates for your training.">
        <h1 className="text-lg font-bold leading-none">Routines</h1>
      </PageHeader>
      <RoutinesLibrary routines={routines} />
    </main>
  );
}
