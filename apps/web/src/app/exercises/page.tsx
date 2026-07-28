import { buildUrl } from "@/lib/url";
import { Exercise } from "@/types/exercise-types";
import { PageHeader } from "@/components/page-header";
import { ExercisesTable } from "./components/exercises-table";
import { Paginator } from "./components/paginator";

async function fetchData(url: string): Promise<Exercise[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch exercises: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const queryParams = await searchParams;

  const pageNumber =
    queryParams.page && Number(queryParams.page) > 0
      ? Number(queryParams.page)
      : 1;
  const limit = queryParams.limit ? Number(queryParams.limit) : 20;
  const pageSize = 19;

  const exerciseData = await fetchData(
    buildUrl(process.env.API_URL, "exercises", {
      offset: (pageNumber - 1) * pageSize,
      limit,
    }),
  );
  const isLastPage = exerciseData.length <= pageSize;

  return (
    <main className="flex flex-col h-dvh w-full gap-2 p-1 md:p-2">
      <PageHeader subtitle="Explore our exercise&apos;s catalog.">
        <h1 className="text-lg font-bold leading-none">Exercises</h1>
      </PageHeader>

      <section className="flex flex-col justify-between h-full min-h-0 rounded-3xl border border-border/70 bg-card/80 p-2 shadow-sm md:p-3 overflow-auto">
        <ExercisesTable exercises={exerciseData.slice(0, pageSize)} />
        <Paginator pageNumber={pageNumber} isLastPage={isLastPage} />
      </section>
    </main>
  );
}
