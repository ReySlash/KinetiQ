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
  const baseUrl = "http://localhost:3000/exercises";
  return (
    <Pagination>
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
