import { LogIn } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import StyledLink from "./styled-link";

type SignedOutStateProps = {
  title: string;
  description: string;
  tooltip: string;
  page: string;
};

export default function SignedOutState(props: SignedOutStateProps) {
  const { title, description, tooltip, page } = props;

  return (
    <Empty className="min-h-full border border-dashed bg-card/50">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LogIn aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <StyledLink href={`/sign-in?callbackURL=%2F${page}`} size="lg">
              Sign in
            </StyledLink>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </EmptyContent>
    </Empty>
  );
}
