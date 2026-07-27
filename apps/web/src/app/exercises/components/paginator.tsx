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
};

export function Paginator(props: PaginatorProps) {
  const { pageNumber, isLastPage } = props;
  const baseUrl = "/exercises";
  return (
    <Pagination className="sticky bottom-0 z-30 bg-card w-fit rounded-xl">
      <PaginationContent>
        {pageNumber > 1 && (
          <>
            <PaginationItem>
              <StyledLink
                variant={"ghost"}
                href={`${baseUrl}?page=${pageNumber - 1}`}
              >
                {" <"} Previous
              </StyledLink>
            </PaginationItem>
            <PaginationItem>
              <StyledLink
                variant={"ghost"}
                href={`${baseUrl}?page=${pageNumber - 1}`}
              >
                {pageNumber - 1}
              </StyledLink>
            </PaginationItem>
          </>
        )}
        <PaginationItem>
          <StyledLink
            variant={"outline"}
            href={`${baseUrl}?page=${pageNumber}`}
          >
            {pageNumber}
          </StyledLink>
        </PaginationItem>
        {isLastPage || (
          <>
            <PaginationItem>
              <StyledLink
                variant={"ghost"}
                href={`${baseUrl}?page=${pageNumber + 1}`}
              >
                {pageNumber + 1}
              </StyledLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <StyledLink
                variant={"ghost"}
                href={`${baseUrl}?page=${pageNumber + 1}`}
              >
                Next {" >"}
              </StyledLink>
            </PaginationItem>
          </>
        )}
      </PaginationContent>
    </Pagination>
  );
}
