import {
  fetchActiveAdoptedTrainingProgram,
  type ActiveAdoptedTrainingProgramResult,
} from "@/lib/adopted-training-programs-server";
import { fetchServerAuthSession } from "@/lib/auth-server";
import { fetchAnalyticsOverviewServer } from "@/lib/analytics-server";
import { buildAnalyticsRequest } from "@/lib/analytics-range";
import { ApiError, isRateLimitError } from "@/lib/api/error";
import { getServerTimezone } from "@/lib/timezone-server";
import {
  fetchActiveWorkoutSession,
  type ActiveWorkoutFetchResult,
} from "@/lib/workout-sessions-server";
import type { AnalyticsOverview } from "@/types/analytics-types";

export type DashboardReadResult<T> = {
  value: T | null;
  error: Error | null;
};

type ActiveProgram = Extract<
  ActiveAdoptedTrainingProgramResult,
  { status: "authenticated" }
>["program"];

type ActiveWorkout = Extract<
  ActiveWorkoutFetchResult,
  { status: "authenticated" }
>["session"];

export type DashboardResources =
  | { status: "unauthenticated" }
  | { status: "rate-limited" }
  | { status: "unavailable" }
  | {
      status: "authenticated";
      authenticated: true;
      userName: string;
      timezone: string | null;
      analytics: DashboardReadResult<AnalyticsOverview>;
      activeProgram: DashboardReadResult<ActiveProgram>;
      activeWorkout: DashboardReadResult<ActiveWorkout>;
    };

export async function readDashboardResources(): Promise<DashboardResources> {
  const timezonePromise = getServerTimezone();
  const resourcePromise = Promise.allSettled([
    fetchServerAuthSession(),
    fetchActiveAdoptedTrainingProgram(),
    fetchActiveWorkoutSession(),
  ]);
  const analyticsPromise = Promise.allSettled([
    timezonePromise.then(readAnalytics),
  ]).then(([result]) => result);

  const [[authResult, programResult, workoutResult], analyticsResult] =
    await Promise.all([resourcePromise, analyticsPromise]);

  if (authResult.status === "rejected") {
    if (isRateLimitError(authResult.reason)) return { status: "rate-limited" };
    if (
      authResult.reason instanceof ApiError &&
      authResult.reason.status >= 500
    ) {
      return { status: "unavailable" };
    }
    throw authResult.reason;
  }

  if (authResult.value.status === "unauthenticated") {
    return { status: "unauthenticated" };
  }
  if (authResult.value.status === "rate-limited") {
    return { status: "rate-limited" };
  }

  if (isRateLimited(programResult) || isRateLimited(workoutResult)) {
    return { status: "rate-limited" };
  }

  return {
    status: "authenticated",
    authenticated: true,
    userName: authResult.value.session.user.name,
    timezone: await timezonePromise,
    analytics: toAnalyticsReadResult(analyticsResult),
    activeProgram: toProgramReadResult(programResult),
    activeWorkout: toWorkoutReadResult(workoutResult),
  };
}

async function readAnalytics(timezone: string | null): Promise<AnalyticsOverview | null> {
  if (!timezone) return null;

  const request = buildAnalyticsRequest(timezone, { range: "1w" });
  if (!request.ok) throw new Error(request.message);

  return fetchAnalyticsOverviewServer(request.request);
}

function isRateLimited<T extends { status: string }>(
  result: PromiseSettledResult<T>,
): boolean {
  return result.status === "rejected"
    ? isRateLimitError(result.reason)
    : result.value.status === "rate-limited";
}

function toAnalyticsReadResult(
  result: PromiseSettledResult<AnalyticsOverview | null>,
): DashboardReadResult<AnalyticsOverview> {
  return result.status === "fulfilled"
    ? { value: result.value, error: null }
    : { value: null, error: toError(result.reason) };
}

function toProgramReadResult(
  result: PromiseSettledResult<ActiveAdoptedTrainingProgramResult>,
): DashboardReadResult<ActiveProgram> {
  return result.status === "fulfilled" && result.value.status === "authenticated"
    ? { value: result.value.program, error: null }
    : {
        value: null,
        error:
          result.status === "rejected"
            ? toError(result.reason)
            : new Error("Active program authentication state is unknown."),
      };
}

function toWorkoutReadResult(
  result: PromiseSettledResult<ActiveWorkoutFetchResult>,
): DashboardReadResult<ActiveWorkout> {
  return result.status === "fulfilled" && result.value.status === "authenticated"
    ? { value: result.value.session, error: null }
    : {
        value: null,
        error:
          result.status === "rejected"
            ? toError(result.reason)
            : new Error("Active workout authentication state is unknown."),
      };
}

function toError(reason: unknown): Error {
  return reason instanceof Error ? reason : new Error("Dashboard read failed.");
}
