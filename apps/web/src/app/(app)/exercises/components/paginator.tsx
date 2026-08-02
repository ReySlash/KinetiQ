import StyledLink from "@/components/styled-link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  buildExercisesCatalogHref,
  type ExercisesCatalogQuery,
} from "./filters/exercise-filters";

type PaginatorProps = {
  pageNumber: number;
  isLastPage: boolean;
  query: ExercisesCatalogQuery;
};

export function Paginator(props: PaginatorProps) {
  const { pageNumber, isLastPage, query } = props;

  function buildHref(nextPage: number) {
    return buildExercisesCatalogHref({
      ...query,
      page: nextPage,
    });
  }

  return (
    <Pagination className="mx-auto w-fit rounded-xl bg-card">
      <PaginationContent>
        {pageNumber > 1 && (
          <>
            <PaginationItem>
              <StyledLink variant={"ghost"} href={buildHref(pageNumber - 1)}>
                {" <"} Previous
              </StyledLink>
            </PaginationItem>
            <PaginationItem>
              <StyledLink variant={"ghost"} href={buildHref(pageNumber - 1)}>
                {pageNumber - 1}
              </StyledLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <StyledLink variant={"outline"} href={buildHref(pageNumber)}>
            {pageNumber}
          </StyledLink>
        </PaginationItem>
        {isLastPage || (
          <>
            <PaginationItem>
              <StyledLink variant={"ghost"} href={buildHref(pageNumber + 1)}>
                {pageNumber + 1}
              </StyledLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <StyledLink variant={"ghost"} href={buildHref(pageNumber + 1)}>
                Next {" >"}
              </StyledLink>
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
