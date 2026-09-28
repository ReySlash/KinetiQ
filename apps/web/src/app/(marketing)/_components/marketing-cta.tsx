"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";

import StyledLink from "@/components/styled-link";

export function MarketingCta({
  href,
  children,
  ariaLabel,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof StyledLink> & {
  ariaLabel?: string;
  showArrow?: boolean;
}) {
  const [isPending, setIsPending] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isPending) {
      event.preventDefault();
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setIsPending(true);
  }

  return (
    <StyledLink
      {...props}
      href={href}
      onClick={handleClick}
      ariaLabel={ariaLabel}
      aria-busy={isPending}
      aria-disabled={isPending}
    >
      {isPending ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : showArrow ? (
        <ArrowRight aria-hidden="true" />
      ) : null}
      {children}
    </StyledLink>
  );
}
