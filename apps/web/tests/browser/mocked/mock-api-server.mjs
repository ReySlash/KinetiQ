import { createServer } from "node:http";

const port = 3102;
const programId = "123e4567-e89b-12d3-a456-426614174000";
const firstOccurrenceId = "223e4567-e89b-12d3-a456-426614174000";
const secondOccurrenceId = "323e4567-e89b-12d3-a456-426614174000";
const workoutSessionId = "423e4567-e89b-12d3-a456-426614174000";
const sessionCookie = "better-auth.session_token=mock-session";
const states = new Map();
const session = {
  session: { id: "mock-session", expiresAt: "2099-01-01T00:00:00.000Z" },
  user: { id: "mock-user", name: "Mock User", email: "reynaldo@example.com", emailVerified: true },
};

function cookieValue(request, name) {
  const prefix = `${name}=`;
  return request.headers.cookie?.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix))?.slice(prefix.length);
}

function hasSessionCookie(request) {
  return request.headers.cookie?.split(";").some((cookie) => cookie.trim() === sessionCookie) ?? false;
}

function scenarioFor(request) { return cookieValue(request, "mock_scenario") ?? "default"; }

function createState(scenario) {
  const occurrenceCount = scenario === "completion" ? 1 : 2;
  const status = scenario === "paused" ? "PAUSED" : scenario === "terminal" ? "COMPLETED" : "ACTIVE";
  const completed = scenario === "terminal";
  const active = scenario === "continue";
  return {
    status,
    occurrences: [
      {
        id: firstOccurrenceId, weekNumber: 1, dayNumber: 1,
        routineNameSnapshot: "Upper A", programSlotNotesSnapshot: "Keep two reps in reserve.",
        status: completed ? "COMPLETED" : active ? "IN_PROGRESS" : "PENDING",
        sourceRoutineAvailable: scenario !== "unavailable",
        sessionAttemptIds: active || completed ? [workoutSessionId] : [],
        activeSessionId: active ? workoutSessionId : null,
        latestSessionId: active || completed ? workoutSessionId : null,
      },
      ...(occurrenceCount === 2 ? [{
        id: secondOccurrenceId, weekNumber: 2, dayNumber: 1,
        routineNameSnapshot: "Lower A", programSlotNotesSnapshot: null,
        status: completed ? "COMPLETED" : "PENDING", sourceRoutineAvailable: true,
        sessionAttemptIds: [], activeSessionId: null, latestSessionId: null,
      }] : []),
    ],
  };
}

function stateFor(request) {
  const scenario = scenarioFor(request);
  if (!states.has(scenario)) states.set(scenario, createState(scenario));
  return states.get(scenario);
}

function adoptedDetail(state) {
  const completedCount = state.occurrences.filter((item) => item.status === "COMPLETED").length;
  const skippedCount = state.occurrences.filter((item) => item.status === "SKIPPED").length;
  const resolvedCount = completedCount + skippedCount;
  const activeSession = state.occurrences.some((item) => item.activeSessionId);
  const nextPendingOccurrence = state.occurrences.find((item) => item.status === "PENDING") ?? null;
  const terminal = state.status === "COMPLETED" || state.status === "CANCELLED";
  return {
    id: programId, programNameSnapshot: "Strength Base", status: state.status,
    durationWeeksSnapshot: 2, startedAt: "2026-09-01T08:00:00.000Z",
    completedAt: state.status === "COMPLETED" ? "2026-09-03T08:00:00.000Z" : null,
    cancelledAt: state.status === "CANCELLED" ? "2026-09-03T08:00:00.000Z" : null,
    totalCount: state.occurrences.length, completedCount, skippedCount, resolvedCount,
    progressPercent: state.occurrences.length ? (resolvedCount / state.occurrences.length) * 100 : 0,
    occurrences: state.occurrences, nextPendingOccurrence,
    actions: {
      canPause: state.status === "ACTIVE" && !activeSession,
      canResume: state.status === "PAUSED" && !activeSession,
      canCancel: !terminal && !activeSession,
      canStartNext: state.status === "ACTIVE" && !activeSession && Boolean(nextPendingOccurrence?.sourceRoutineAvailable),
      canSkipNext: state.status === "ACTIVE" && !activeSession && Boolean(nextPendingOccurrence),
    },
  };
}

function workoutDetail(state) {
  const occurrence = state.occurrences[0];
  const completed = occurrence.status === "COMPLETED";
  const cancelled = occurrence.status === "PENDING" && occurrence.sessionAttemptIds.length > 0;
  return {
    id: workoutSessionId, status: completed ? "COMPLETED" : cancelled ? "CANCELLED" : "IN_PROGRESS",
    sourceRoutineId: null, sourceRoutineNameSnapshot: "Upper A",
    provenance: {
      sourceKind: "PROGRAM_WORKOUT", adoptedTrainingProgramId: programId,
      programWorkoutOccurrenceId: firstOccurrenceId, programNameSnapshot: "Strength Base",
      programWeekNumber: 1, programDayNumber: 1, programRoutineNameSnapshot: "Upper A",
    },
    timezone: "Asia/Qatar", startedAt: "2026-09-03T08:00:00.000Z",
    completedAt: completed ? "2026-09-03T09:00:00.000Z" : null,
    cancelledAt: cancelled ? "2026-09-03T08:15:00.000Z" : null,
    createdAt: "2026-09-03T08:00:00.000Z", updatedAt: "2026-09-03T08:00:00.000Z",
    performances: [{
      id: "523e4567-e89b-12d3-a456-426614174000", exerciseId: "623e4567-e89b-12d3-a456-426614174000",
      exerciseNameSnapshot: "Bench Press", order: 0, targetSetCount: 3,
      targetMinReps: 6, targetMaxReps: 8, targetRir: 2, targetRestSeconds: 120,
      targetTempo: null, prescriptionNotes: null, completedSets: [],
    }],
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); } });
    request.on("error", reject);
  });
}

function send(response, status, body) {
  response.writeHead(status);
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3101");
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.setHeader("Content-Type", "application/json");
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (request.method === "OPTIONS") return send(response, 204);
  if (url.pathname === "/api/health") return send(response, 200, { status: "ok" });
  if (url.pathname === "/api/auth/get-session") return send(response, 200, hasSessionCookie(request) ? session : null);
  if (request.method === "POST" && url.pathname === "/api/auth/sign-in/email") {
    const body = await readJsonBody(request);
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (body.email === "wrong@example.com") return send(response, 401, { message: "Invalid credentials" });
    response.setHeader("Set-Cookie", `${sessionCookie}; Path=/; HttpOnly; SameSite=Lax`);
    return send(response, 200, session);
  }
  if (!hasSessionCookie(request)) return send(response, 401, { message: "Authentication required" });

  const scenario = scenarioFor(request);
  const state = stateFor(request);
  const isProgramRead =
    url.pathname === "/api/user-training-programs/active" ||
    url.pathname === `/api/user-training-programs/${programId}`;
  if (scenario === "loading" && isProgramRead) await new Promise((resolve) => setTimeout(resolve, 1200));
  if (scenario === "error" && isProgramRead) return send(response, 500, { message: "Program service unavailable" });

  if (request.method === "GET" && url.pathname === "/api/training-programs/strength-base") {
    return send(response, 200, {
      slug: "strength-base", name: "Strength Base", description: "A focused two-week strength plan.",
      visibility: "GLOBAL", durationWeeks: 2, updatedAt: "2026-09-01T08:00:00.000Z",
      schedule: state.occurrences.map((item) => ({
        weekNumber: item.weekNumber, dayNumber: item.dayNumber, notes: item.programSlotNotesSnapshot,
        routine: { slug: item.routineNameSnapshot.toLowerCase().replaceAll(" ", "-"), name: item.routineNameSnapshot, visibility: "GLOBAL" },
      })),
    });
  }
  if (request.method === "GET" && url.pathname === "/api/training-programs") return send(response, 200, [{ slug: "strength-base", name: "Strength Base", description: "A focused plan.", visibility: "GLOBAL", durationWeeks: 2, updatedAt: "2026-09-01T08:00:00.000Z" }]);

  if (request.method === "POST" && url.pathname === "/api/user-training-programs") {
    if (scenario === "adoption-conflict") return send(response, 409, { error: { message: "Already active", code: "ADOPTED_TRAINING_PROGRAM_ALREADY_NON_TERMINAL" } });
    states.set(scenario, createState(scenario));
    return send(response, scenario === "adoption-200" ? 200 : 201, { id: programId, status: "ACTIVE", startedAt: "2026-09-01T08:00:00.000Z" });
  }
  if (request.method === "GET" && url.pathname === "/api/user-training-programs/active") return send(response, 200, scenario === "empty" ? null : adoptedDetail(state));
  if (request.method === "GET" && url.pathname === `/api/user-training-programs/${programId}`) return send(response, 200, adoptedDetail(state));

  const lifecycle = url.pathname.match(new RegExp(`^/api/user-training-programs/${programId}/(pause|resume|cancel)$`));
  if (request.method === "POST" && lifecycle) {
    state.status = lifecycle[1] === "pause" ? "PAUSED" : lifecycle[1] === "resume" ? "ACTIVE" : "CANCELLED";
    return send(response, 200, { id: programId, status: state.status, updatedAt: "2026-09-03T08:00:00.000Z" });
  }

  const occurrenceAction = url.pathname.match(new RegExp(`^/api/user-training-programs/${programId}/workouts/([^/]+)/(start|skip)$`));
  if (request.method === "POST" && occurrenceAction) {
    const occurrence = state.occurrences.find((item) => item.id === occurrenceAction[1]);
    if (!occurrence) return send(response, 404, { message: "Not found" });
    if (occurrenceAction[2] === "skip") {
      occurrence.status = "SKIPPED";
      if (state.occurrences.every((item) => item.status === "COMPLETED" || item.status === "SKIPPED")) state.status = "COMPLETED";
      return send(response, 200, { id: programId, status: state.status, updatedAt: "2026-09-03T08:00:00.000Z" });
    }
    if (!occurrence.sourceRoutineAvailable) return send(response, 422, { message: "Unavailable", code: "ADOPTED_TRAINING_PROGRAM_SOURCE_UNAVAILABLE" });
    occurrence.status = "IN_PROGRESS";
    occurrence.activeSessionId = workoutSessionId;
    occurrence.latestSessionId = workoutSessionId;
    occurrence.sessionAttemptIds.push(workoutSessionId);
    return send(response, 201, { workoutSessionId, occurrenceId: occurrence.id, sessionStatus: "IN_PROGRESS", occurrenceStatus: "IN_PROGRESS" });
  }

  if (request.method === "GET" && url.pathname === `/api/workout-sessions/${workoutSessionId}`) return send(response, 200, workoutDetail(state));
  if (request.method === "POST" && url.pathname === `/api/workout-sessions/${workoutSessionId}/complete`) {
    const occurrence = state.occurrences[0];
    occurrence.status = "COMPLETED";
    occurrence.activeSessionId = null;
    if (state.occurrences.every((item) => item.status === "COMPLETED" || item.status === "SKIPPED")) state.status = "COMPLETED";
    return send(response, 200, { id: workoutSessionId, status: "COMPLETED" });
  }
  if (request.method === "POST" && url.pathname === `/api/workout-sessions/${workoutSessionId}/cancel`) {
    const occurrence = state.occurrences[0];
    occurrence.status = "PENDING";
    occurrence.activeSessionId = null;
    return send(response, 200, { id: workoutSessionId, status: "CANCELLED" });
  }
  if (request.method === "GET" && url.pathname === "/api/exercises") return send(response, 200, []);
  if (url.pathname.startsWith("/api/routines")) return send(response, 200, []);
  if (request.method === "GET" && url.pathname === "/api/workout-sessions") return send(response, 200, []);
  return send(response, 404, { message: "Not found" });
});

server.listen(port, "127.0.0.1");
function shutdown() { server.close(() => process.exit(0)); }
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
