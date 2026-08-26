import { clientRequest } from "@/lib/api/client-request";
import type {
  RecordWorkoutSetInput,
  StartWorkoutInput,
  UpdateWorkoutSetInput,
  WorkoutSession,
  WorkoutSessionFilters,
  WorkoutSessionListItem,
  WorkoutSessionMutation,
} from "@/types/workout-session-types";

function dateValue(value: Date | undefined): string | undefined {
  return value?.toISOString();
}

export function listWorkoutSessions(
  filters: WorkoutSessionFilters = {},
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from.toISOString());
  if (filters.to) params.set("to", filters.to.toISOString());
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  return clientRequest<WorkoutSessionListItem[]>(
    `workout-sessions?${params.toString()}`,
  );
}

export function startWorkout(input: StartWorkoutInput) {
  return clientRequest<WorkoutSessionMutation>("workout-sessions", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      startedAt: dateValue(input.startedAt),
    }),
  });
}

export function getActiveWorkout() {
  return clientRequest<WorkoutSession | null>("workout-sessions/active");
}

export function getWorkout(workoutSessionId: string) {
  return clientRequest<WorkoutSession>(`workout-sessions/${workoutSessionId}`);
}

export function addWorkoutExercise(
  workoutSessionId: string,
  input: { exerciseId: string },
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/exercises`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function removeWorkoutExercise(
  workoutSessionId: string,
  input: { exercisePerformanceId: string },
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/exercises`,
    { method: "DELETE", body: JSON.stringify(input) },
  );
}

export function recordWorkoutSet(
  workoutSessionId: string,
  exercisePerformanceId: string,
  input: RecordWorkoutSetInput,
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/exercises/${exercisePerformanceId}/sets`,
    {
      method: "POST",
      body: JSON.stringify({ ...input, completedAt: dateValue(input.completedAt) }),
    },
  );
}

export function updateWorkoutSet(
  workoutSessionId: string,
  exercisePerformanceId: string,
  completedSetId: string,
  input: UpdateWorkoutSetInput,
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/exercises/${exercisePerformanceId}/sets/${completedSetId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function deleteWorkoutSet(
  workoutSessionId: string,
  exercisePerformanceId: string,
  completedSetId: string,
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/exercises/${exercisePerformanceId}/sets/${completedSetId}`,
    { method: "DELETE" },
  );
}

export function completeWorkout(
  workoutSessionId: string,
  input: { completedAt?: Date } = {},
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/complete`,
    {
      method: "POST",
      body: JSON.stringify({ completedAt: dateValue(input.completedAt) }),
    },
  );
}

export function cancelWorkout(
  workoutSessionId: string,
  input: { cancelledAt?: Date } = {},
) {
  return clientRequest<WorkoutSessionMutation>(
    `workout-sessions/${workoutSessionId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ cancelledAt: dateValue(input.cancelledAt) }),
    },
  );
}
