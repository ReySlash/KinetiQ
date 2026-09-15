import type { Metadata } from "next";

import { DashboardAnalytics } from "./components/dashboard-analytics";
import { DashboardHeader } from "./components/dashboard-header";
import { TrainingPlanCard } from "./components/training-plan-card";
import { selectDashboardPrimaryAction } from "./components/dashboard-state";
import SignedOutState from "@/components/signed-out-state";
import { PageHeader } from "@/components/page-header";
import { RateLimitedState } from "@/components/rate-limited-state";
import { ApiError } from "@/lib/api/error";
import { readDashboardResources } from "./dashboard-resources";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const resources = await readDashboardResources();
  if ("status" in resources && resources.status === "rate-limited") {
    return (
      <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2">
        <PageHeader subtitle="Your personal training dashboard.">
          <h1 className="text-lg font-bold leading-none">Dashboard</h1>
        </PageHeader>
        <section className="flex min-h-0 flex-1 flex-col overflow-auto px-1 py-1 md:px-0">
          <RateLimitedState title="Dashboard is temporarily unavailable" description="Too many requests were made. Please wait a moment and try again." />
        </section>
      </main>
    );
  }
  const authenticatedResources =
    resources.status === "authenticated" ? resources : null;
  const action = authenticatedResources
    ? selectDashboardPrimaryAction({
        activeWorkout: authenticatedResources.activeWorkout.value,
        activeWorkoutError: authenticatedResources.activeWorkout.error,
        activeProgram: authenticatedResources.activeProgram.value,
        activeProgramError: authenticatedResources.activeProgram.error,
      })
    : null;

  return (
    <main className="flex h-dvh w-full flex-col gap-1 px-0.5 pb-13 md:gap-2 md:px-2 md:pb-2 md:pt-0">
      {authenticatedResources && action ? (
        <DashboardHeader name={authenticatedResources.userName} />
      ) : (
        <PageHeader subtitle="Your personal training dashboard.">
          <h1 className="text-lg font-bold leading-none">Dashboard</h1>
        </PageHeader>
      )}
      <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 py-1 md:px-0">
        {!authenticatedResources || !action ? (
          <SignedOutState
            title="Sign in to see your training dashboard"
            description="Your active workouts, programs, and training history are private to your account."
            tooltip="Sign in to open your dashboard"
            page="dashboard"
          />
        ) : (
          <DashboardAnalytics
            overview={authenticatedResources.analytics.value}
            timezone={authenticatedResources.timezone}
            failure={authenticatedResources.analytics.error ? {
              status: authenticatedResources.analytics.error instanceof ApiError
                ? authenticatedResources.analytics.error.status
                : 500,
              message: authenticatedResources.analytics.error.message,
            } : undefined}
          >
            <TrainingPlanCard
              action={action}
              activeWorkout={authenticatedResources.activeWorkout.value}
              activeProgram={authenticatedResources.activeProgram.value}
            />
          </DashboardAnalytics>
        )}
      </section>
    </main>
  );
}
