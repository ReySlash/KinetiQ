import type { Metadata } from "next";

import { fetchServerAuthSession } from "@/lib/auth-server";
import {
  fetchActiveAdoptedTrainingProgram,
  type ActiveAdoptedTrainingProgramResult,
} from "@/lib/adopted-training-programs-server";
import {
  fetchActiveWorkoutSession,
  type ActiveWorkoutFetchResult,
} from "@/lib/workout-sessions-server";
import { DashboardAnalytics } from "./components/dashboard-analytics";
import { DashboardHeader } from "./components/dashboard-header";
import { TrainingPlanCard } from "./components/training-plan-card";
import { selectDashboardPrimaryAction } from "./components/dashboard-state";
import SignedOutState from "@/components/signed-out-state";
import { PageHeader } from "@/components/page-header";
import { RateLimitedState } from "@/components/rate-limited-state";
import { isRateLimitError } from "@/lib/api/error";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

type DashboardReadResult<T> = {
  value: T | null;
  error: Error | null;
};

type DashboardResources =
  | { status: "unauthenticated" }
  | { status: "rate-limited" }
  | {
      status: "authenticated";
      authenticated: true;
      userName: string;
      activeProgram: DashboardReadResult<
        Extract<
          ActiveAdoptedTrainingProgramResult,
          { status: "authenticated" }
        >["program"]
      >;
      activeWorkout: DashboardReadResult<
        Extract<
          ActiveWorkoutFetchResult,
          { status: "authenticated" }
        >["session"]
      >;
    };

async function readDashboardResources(): Promise<DashboardResources> {
  const [authResult, programResult, workoutResult] = await Promise.allSettled([
    fetchServerAuthSession(),
    fetchActiveAdoptedTrainingProgram(),
    fetchActiveWorkoutSession(),
  ]);

  if (authResult.status === "rejected") {
    if (isRateLimitError(authResult.reason)) return { status: "rate-limited" };
    throw authResult.reason;
  }

  if (authResult.value.status === "unauthenticated") {
    return { status: "unauthenticated" };
  }
  if (authResult.value.status === "rate-limited") {
    return { status: "rate-limited" };
  }

  if (
    (programResult.status === "fulfilled" && programResult.value.status === "rate-limited") ||
    (workoutResult.status === "fulfilled" && workoutResult.value.status === "rate-limited") ||
    (programResult.status === "rejected" && isRateLimitError(programResult.reason)) ||
    (workoutResult.status === "rejected" && isRateLimitError(workoutResult.reason))
  ) {
    return { status: "rate-limited" };
  }

  const activeProgram: DashboardReadResult<
    Extract<
      ActiveAdoptedTrainingProgramResult,
      { status: "authenticated" }
    >["program"]
  > =
    programResult.status === "fulfilled" &&
    programResult.value.status === "authenticated"
      ? { value: programResult.value.program, error: null }
      : {
          value: null,
          error:
            programResult.status === "rejected"
              ? toError(programResult.reason)
              : new Error("Active program authentication state is unknown."),
        };
  const activeWorkout: DashboardReadResult<
    Extract<ActiveWorkoutFetchResult, { status: "authenticated" }>["session"]
  > =
    workoutResult.status === "fulfilled" &&
    workoutResult.value.status === "authenticated"
      ? { value: workoutResult.value.session, error: null }
      : {
          value: null,
          error:
            workoutResult.status === "rejected"
              ? toError(workoutResult.reason)
              : new Error("Active workout authentication state is unknown."),
        };

  return {
    status: "authenticated",
    authenticated: true,
    userName: authResult.value.session.user.name,
    activeProgram,
    activeWorkout,
  };
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error("Dashboard read failed.");
}

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
          <DashboardAnalytics>
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
