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
import { DashboardSignedOutState } from "./components/dashboard-signed-out-state";
import { TrainingPlanCard } from "./components/training-plan-card";
import { selectDashboardPrimaryAction } from "./components/dashboard-state";

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
  | { authenticated: false }
  | {
      authenticated: true;
      userName: string;
      activeProgram: DashboardReadResult<
        Extract<ActiveAdoptedTrainingProgramResult, { status: "authenticated" }>["program"]
      >;
      activeWorkout: DashboardReadResult<
        Extract<ActiveWorkoutFetchResult, { status: "authenticated" }>["session"]
      >;
    };

async function readDashboardResources(): Promise<DashboardResources> {
  const [authResult, programResult, workoutResult] = await Promise.allSettled([
    fetchServerAuthSession(),
    fetchActiveAdoptedTrainingProgram(),
    fetchActiveWorkoutSession(),
  ]);

  if (authResult.status === "rejected") {
    throw authResult.reason;
  }

  if (authResult.value.status === "unauthenticated") {
    return { authenticated: false };
  }

  const activeProgram: DashboardReadResult<
    Extract<ActiveAdoptedTrainingProgramResult, { status: "authenticated" }>["program"]
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
  const authenticatedResources = resources.authenticated ? resources : null;
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
      {resources.authenticated && action ? (
        <DashboardHeader name={resources.userName} />
      ) : null}
      <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1 py-1 md:px-0">
        {!authenticatedResources || !action ? (
          <DashboardSignedOutState />
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
