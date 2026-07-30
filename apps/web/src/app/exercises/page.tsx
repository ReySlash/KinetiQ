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

function getQueryValue(
  queryParams: SearchParams,
  key: string,
): string | undefined {
  const value = queryParams[key];

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

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
  const pageSize = 19;
  const search = getQueryValue(queryParams, "search");
  const normalizedSearch =
    search && search.trim().length >= 3 ? search.trim() : undefined;

  const exerciseData = await fetchData(
    buildUrl(process.env.API_URL, "exercises", {
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize + 1,
      search: normalizedSearch,
    }),
  );
  const isLastPage = exerciseData.length <= pageSize;
  const visibleExercises = exerciseData.slice(0, pageSize);

  return (
    <main className="flex flex-col h-dvh w-full gap-2 p-1 md:p-2">
      <PageHeader subtitle="Explore our exercise's catalog.">
        <h1 className="text-lg font-bold leading-none">Exercises</h1>
      </PageHeader>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto p-2 md:p-3">
          <ExercisesTable exercises={visibleExercises} />
        </div>
        <div className="shrink-0 border-t border-border/70 px-2 py-2 md:px-3">
          <Paginator
            pageNumber={pageNumber}
            isLastPage={isLastPage}
            search={normalizedSearch}
          />
        </div>
      </section>
    </main>
  );
}
