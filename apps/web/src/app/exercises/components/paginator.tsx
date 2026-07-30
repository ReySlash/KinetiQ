import StyledLink from "@/components/styled-link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
type PaginatorProps = {
  pageNumber: number;
  isLastPage: boolean;
  search?: string;
};

export function Paginator(props: PaginatorProps) {
  const { pageNumber, isLastPage, search } = props;
  const baseUrl = "/exercises";

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();

    if (search) {
      params.set("search", search);
    }

    params.set("page", String(nextPage));

    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
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
