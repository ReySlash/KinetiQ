import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import StyledLink from "@/components/styled-link";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";

type MarketingFeatureProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  href: string;
  linkLabel: string;
  reverse?: boolean;
  children: ReactNode;
};

export function MarketingFeature({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  reverse = false,
  children,
}: MarketingFeatureProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-border/60">
      <ScrollReveal
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:px-8",
          reverse && "lg:grid-cols-[1.25fr_0.75fr]",
        )}
      >
        <div className={cn("max-w-lg", reverse && "lg:order-2")}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {description}
          </p>
          <StyledLink href={href} variant="link" className="mt-5 h-auto px-0 py-1 font-semibold">
            {linkLabel}
            <ArrowRight aria-hidden="true" />
          </StyledLink>
        </div>

        <div className={cn(reverse && "lg:order-1")}>{children}</div>
      </ScrollReveal>
    </section>
  );
}
