import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, BarChart3, BookOpenCheck, ListChecks } from "lucide-react";

import StyledLink from "@/components/styled-link";
import { getSiteUrl } from "@/lib/site";
import { MarketingFeature } from "./_components/marketing-feature";
import { MarketingFooter } from "./_components/marketing-footer";
import { MarketingHeader } from "./_components/marketing-header";
import {
  ExerciseIntelligencePreview,
  ProgrammingWorkflowPreview,
  ProgressPreview,
} from "./_components/marketing-previews";
import { ScrollReveal } from "./_components/scroll-reveal";

const description =
  "Explore exercises, understand muscle involvement, build reusable routines, and organize structured training programs with KinetiQ.";

export const metadata: Metadata = {
  title: { absolute: "KinetiQ — Structured Strength Training" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "KinetiQ",
    title: "KinetiQ — Structured Strength Training",
    description,
    images: [
      {
        url: "/hero-image.png",
        width: 1448,
        height: 1086,
        alt: "KinetiQ exercise intelligence interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KinetiQ — Structured Strength Training",
    description,
    images: ["/hero-image.png"],
  },
};

const benefits = [
  {
    icon: BookOpenCheck,
    title: "Exercise intelligence",
    description: "Useful training context without the noise.",
  },
  {
    icon: ListChecks,
    title: "Reusable programming",
    description: "Build routines and organize them into programs.",
  },
  {
    icon: BarChart3,
    title: "Progress that matters",
    description: "See patterns across training and performance.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "KinetiQ",
  url: getSiteUrl(),
  description,
};

export default function MarketingPage() {
  return (
    <div className="dark min-h-dvh overflow-x-clip bg-background text-foreground bg-[radial-gradient(circle_at_75%_5%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_28rem)]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-100 -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-3 focus:ring-ring/50"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <section
          id="about"
          aria-labelledby="hero-title"
          className="scroll-mt-20"
        >
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6 sm:py-4 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-8">
            <div className="relative z-10 order-2 mx-auto max-w-xl text-center lg:order-1 lg:mx-0 lg:text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary sm:mb-2 lg:mb-3">
                Train with clarity
              </p>
              <h1
                id="hero-title"
                className="text-[clamp(1.9rem,9.5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
              >
                <span className="block text-primary">Structured</span>
                <span className="mt-1 block whitespace-nowrap sm:mt-2">
                  strength training.
                </span>
              </h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base lg:mx-0 lg:mt-4 lg:text-lg">
                Train with better context, better programming, and a clearer
                understanding of every exercise.
              </p>

              <div className="mt-3 flex justify-center gap-3 sm:mt-4 lg:mt-6 lg:justify-start">
                <StyledLink
                  href="/sign-up"
                  size="lg"
                  className="h-10 min-w-0 flex-1 rounded-lg px-3 text-xs sm:h-11 sm:flex-none sm:px-5 sm:text-sm sm:w-48"
                >
                  Get started
                </StyledLink>
                <StyledLink
                  href="/exercises"
                  variant="outline"
                  size="lg"
                  className="h-10 min-w-0 flex-1 rounded-lg border-border/80 bg-background/60 px-3 text-xs sm:h-11 sm:flex-none sm:px-5 sm:text-sm sm:w-48"
                >
                  Explore exercises
                  <ArrowRight aria-hidden="true" />
                </StyledLink>
              </div>

              <ul
                className="mt-3 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-4 lg:mt-8 lg:gap-5"
                aria-label="KinetiQ benefits"
              >
                {benefits.map(
                  ({ icon: Icon, title, description: itemDescription }) => (
                    <li
                      key={title}
                      className="border-l border-border/80 pl-2 sm:pl-4 lg:text-left"
                    >
                      <Icon
                        className="mx-auto size-4 text-primary lg:mx-0"
                        aria-hidden="true"
                      />
                      <p className="mt-1 text-xs font-medium leading-4 sm:mt-2 sm:text-sm lg:mt-3">
                        {title}
                      </p>
                      <p className="mt-1 text-xs leading-4 text-muted-foreground sm:leading-5">
                        {itemDescription}
                      </p>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="relative order-1 mx-auto flex w-full max-w-2xl items-center justify-center lg:order-2 lg:max-w-none">
              <div className="absolute inset-10 -z-10 rounded-full bg-primary/10 blur-3xl" />
              <Image
                src="/hero-image.png"
                alt="KinetiQ interface showing a barbell back squat with muscle involvement and exercise details"
                width={1448}
                height={1086}
                preload
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto max-h-[34svh] w-full object-contain drop-shadow-[0_30px_70px_rgb(0_0_0/0.55)] lg:max-h-[calc(100svh-8rem)]"
              />
            </div>
          </div>
        </section>

        <MarketingFeature
          id="exercises"
          eyebrow="Exercise intelligence"
          title={
            <>
              Understand the movement.{" "}
              <span className="text-primary">Train with purpose.</span>
            </>
          }
          description="Go beyond exercise names. Review mechanics, classifications, and muscle involvement so every movement has a clear role in your training."
          href="/exercises"
          linkLabel="Explore exercises"
        >
          <div id="muscles" className="scroll-mt-24">
            <ExerciseIntelligencePreview />
          </div>
        </MarketingFeature>

        <MarketingFeature
          id="programs"
          eyebrow="Programming workflow"
          title={
            <>
              From exercises to{" "}
              <span className="text-primary">structured programs.</span>
            </>
          }
          description="Select movements, define reusable routines, and arrange them across multiple weeks without losing the details that make the plan useful."
          href="/training-programs"
          linkLabel="Explore training programs"
          reverse
        >
          <ProgrammingWorkflowPreview />
        </MarketingFeature>

        <MarketingFeature
          id="progress"
          eyebrow="Training progress"
          title={
            <>
              Track progress.{" "}
              <span className="text-primary">See what matters.</span>
            </>
          }
          description="Bring training history into focus with useful trends, consistency signals, and performance context designed to support better decisions."
          href="/progress"
          linkLabel="Explore progress"
        >
          <ProgressPreview />
        </MarketingFeature>

        <section
          aria-labelledby="final-cta-title"
          className="border-t border-border/60"
        >
          <ScrollReveal className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/70 px-6 py-12 text-center shadow-2xl shadow-black/20 sm:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_55%)]" />
              <div className="relative">
                <h2
                  id="final-cta-title"
                  className="text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  Ready to train smarter?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  Build a clearer training system with KinetiQ.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <StyledLink
                    href="/sign-up"
                    size="lg"
                    className="h-11 w-full rounded-lg px-5 sm:w-48"
                  >
                    Get started
                  </StyledLink>
                  <StyledLink
                    href="/exercises"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full rounded-lg border-border/80 bg-background/50 px-5 sm:w-48"
                  >
                    Explore exercises
                    <ArrowRight aria-hidden="true" />
                  </StyledLink>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <MarketingFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
