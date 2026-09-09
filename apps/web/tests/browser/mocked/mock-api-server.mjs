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
        sourceRoutineSlug: scenario === "unavailable" ? null : "upper-a",
        status: completed ? "COMPLETED" : active ? "IN_PROGRESS" : "PENDING",
        sourceRoutineAvailable: scenario !== "unavailable",
        sessionAttemptIds: active || completed ? [workoutSessionId] : [],
        activeSessionId: active ? workoutSessionId : null,
        latestSessionId: active || completed ? workoutSessionId : null,
      },
      ...(occurrenceCount === 2 ? [{
        id: secondOccurrenceId, weekNumber: 2, dayNumber: 1,
        routineNameSnapshot: "Lower A", programSlotNotesSnapshot: null,
        sourceRoutineSlug: "lower-a",
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

function volumeCompleteness(status = "COMPLETE", includedSetCount = 18, excludedSetCount = 0) {
  return { status, includedSetCount, excludedSetCount };
}

function analyticsOverview(scenario) {
  const empty = scenario === "analytics-empty";
  const partial = scenario === "analytics-partial";
  const completeness = partial
    ? volumeCompleteness("PARTIAL", 16, 2)
    : empty
      ? volumeCompleteness("UNAVAILABLE", 0, 0)
      : volumeCompleteness("COMPLETE", 18, 0);
  const totals = {
    completedWorkouts: empty ? 0 : 4,
    trainingDays: empty ? 0 : 3,
    completedWorkingSets: empty ? 0 : 18,
    warmupSets: empty ? 0 : 5,
    totalRepetitions: empty ? 0 : 146,
    volumeLoadKg: empty ? null : "8650.00",
    activeWeeks: empty ? 0 : 2,
    completeWeeks: empty ? 0 : 1,
    averageWorkoutsPerCompleteWeek: empty ? 0 : 3,
  };
  const exerciseNames = [
    ["barbell-back-squat", "Barbell Back Squat", 6, 48, "140.00"],
    ["bench-press", "Bench Press", 4, 32, "100.00"],
    ["romanian-deadlift", "Romanian Deadlift", 3, 24, "125.00"],
    ["lat-pulldown", "Lat Pulldown", 2, 18, "70.00"],
    ["cable-row", "Cable Row", 2, 16, "65.00"],
    ["pull-up", "Pull Up", 1, 8, "0.00"],
  ];
  return {
    period: {
      from: "2026-07-13T00:00:00.000+03:00",
      to: "2026-09-07T23:59:59.999+03:00",
      timezone: "Asia/Qatar",
      includesPartialCurrentWeek: true,
    },
    totals,
    volumeCompleteness: completeness,
    weekly: [
      { weekStart: "2026-08-17", weekEnd: "2026-08-23", completedWorkouts: 0, trainingDays: 0, completedWorkingSets: 0, warmupSets: 0, totalRepetitions: 0, volumeLoadKg: null, volumeCompleteness: empty ? completeness : volumeCompleteness("UNAVAILABLE", 0, 0) },
      { weekStart: "2026-08-24", weekEnd: "2026-08-30", completedWorkouts: empty ? 0 : 2, trainingDays: empty ? 0 : 2, completedWorkingSets: empty ? 0 : 8, warmupSets: empty ? 0 : 2, totalRepetitions: empty ? 0 : 64, volumeLoadKg: empty ? null : "3650.00", volumeCompleteness: empty ? completeness : partial ? completeness : volumeCompleteness("COMPLETE", 8, 0) },
      { weekStart: "2026-08-31", weekEnd: "2026-09-06", completedWorkouts: empty ? 0 : 2, trainingDays: empty ? 0 : 1, completedWorkingSets: empty ? 0 : 10, warmupSets: empty ? 0 : 3, totalRepetitions: empty ? 0 : 82, volumeLoadKg: empty ? null : "5000.00", volumeCompleteness: empty ? completeness : partial ? completeness : volumeCompleteness("COMPLETE", 10, 0) },
      { weekStart: "2026-09-07", weekEnd: "2026-09-13", completedWorkouts: 0, trainingDays: 0, completedWorkingSets: 0, warmupSets: 0, totalRepetitions: 0, volumeLoadKg: null, volumeCompleteness: volumeCompleteness("UNAVAILABLE", 0, 0) },
    ],
    exercises: empty ? [] : exerciseNames.map(([slug, name, sets, repetitions, maximum], index) => ({
      exerciseId: `exercise-${index}`,
      exerciseSlug: slug,
      exerciseNameSnapshot: name,
      completedWorkoutCount: index < 3 ? 2 : 1,
      completedWorkingSetCount: sets,
      totalRepetitions: repetitions,
      maximumLoadKg: maximum,
      lastWorkingSet: {
        repetitions: index === 5 ? 8 : 6,
        loadKg: maximum,
        completedAt: `2026-09-0${Math.max(1, 6 - index)}T18:00:00.000Z`,
      },
      volumeLoadKg: index === 5 ? null : "1200.00",
      volumeCompleteness: partial && index === 1 ? volumeCompleteness("PARTIAL", 3, 1) : index === 5 ? volumeCompleteness("UNAVAILABLE", 0, Number(sets)) : volumeCompleteness("COMPLETE", Number(sets), 0),
    })),
    recentWorkouts: empty ? [] : [
      ["session-4", "Upper strength", "2026-09-06T18:00:00.000Z", 6, 48, "3200.00"],
      ["session-3", "Lower strength", "2026-09-04T18:00:00.000Z", 5, 42, "2800.00"],
      ["session-2", "Pull day", "2026-09-02T18:00:00.000Z", 4, 32, "1450.00"],
      ["session-1", "Bodyweight circuit", "2026-08-30T18:00:00.000Z", 3, 24, null],
    ].map(([id, name, completedAt, sets, repetitions, volume], index) => ({
      workoutSessionId: id,
      displayName: name,
      startedAt: completedAt,
      completedAt,
      completedWorkingSetCount: sets,
      totalRepetitions: repetitions,
      volumeLoadKg: volume,
      volumeCompleteness: index === 3 ? volumeCompleteness("UNAVAILABLE", 0, 3) : completeness,
    })),
    comparison: {
      period: { from: "2026-05-18T00:00:00.000+03:00", to: "2026-07-12T23:59:59.999+03:00" },
      totals: { ...totals, completedWorkouts: empty ? 0 : 3, completedWorkingSets: empty ? 0 : 15, totalRepetitions: empty ? 0 : 120, volumeLoadKg: empty || partial ? null : "7200.00" },
      volumeCompleteness: completeness,
    },
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
  if (request.method === "GET" && url.pathname === "/api/workout-sessions/active") {
    if (scenario === "dashboard-workout-error") return send(response, 500, { message: "Active workout service unavailable" });
    return send(response, 200, scenario === "continue" ? workoutDetail(state) : null);
  }
  if (request.method === "GET" && url.pathname === "/api/analytics/overview") {
    if (scenario === "analytics-loading") await new Promise((resolve) => setTimeout(resolve, 1200));
    if (scenario === "analytics-error") return send(response, 500, { message: "Analytics service unavailable" });
    return send(response, 200, analyticsOverview(scenario));
  }
  const isProgramRead =
    url.pathname === "/api/user-training-programs/active" ||
    url.pathname === `/api/user-training-programs/${programId}`;
  if (scenario === "loading" && isProgramRead) await new Promise((resolve) => setTimeout(resolve, 1200));
  if ((scenario === "error" || scenario === "dashboard-program-error") && isProgramRead) return send(response, 500, { message: "Program service unavailable" });

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
