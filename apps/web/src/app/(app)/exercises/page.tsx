import { buildApiUrl } from "@/lib/url";
import { Exercise } from "@/types/exercise-types";
import { PageHeader } from "@/components/page-header";
import { ExercisesTable } from "./components/exercises-table";
import {
  parseExercisesCatalogQuery,
  type ExercisesCatalogQuery,
} from "./components/filters/exercise-filters";
import { FiltersToolbar } from "./components/filters/filters-toolbar";
import { Paginator } from "./components/paginator";

export const dynamic = "force-dynamic";

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
  const filters: ExercisesCatalogQuery =
    parseExercisesCatalogQuery(queryParams);

  const pageNumber =
    queryParams.page && Number(queryParams.page) > 0
      ? Number(queryParams.page)
      : 1;
  const pageSize = 19;

  const exerciseData = await fetchData(
    buildApiUrl("exercises", {
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize + 1,
      search: filters.search,
      forceType: filters.forceType,
      laterality: filters.laterality,
      skillLevel: filters.skillLevel,
    }),
  );
  const isLastPage = exerciseData.length <= pageSize;
  const visibleExercises = exerciseData.slice(0, pageSize);

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      <PageHeader subtitle="Explore our exercise's catalog.">
        <h1 className="text-lg font-bold leading-none">Exercises</h1>
      </PageHeader>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-card/80 shadow-sm md:rounded-2xl">
        <FiltersToolbar />
        <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
          <ExercisesTable exercises={visibleExercises} />
        </div>
        <div className="shrink-0 border-t border-border/70 px-2 py-1 md:px-3">
          <Paginator
            pageNumber={pageNumber}
            isLastPage={isLastPage}
            query={filters}
          />
        </div>
      </section>
    </main>
  );
}
