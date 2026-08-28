import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MoreLinkProps = {
  href: string;
  tooltip: string;
  ariaLabel?: string;
};

export function MoreLink({ href, tooltip, ariaLabel = tooltip }: MoreLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={ariaLabel}
          />
        }
      >
        <MoreHorizontal className="size-5" />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
