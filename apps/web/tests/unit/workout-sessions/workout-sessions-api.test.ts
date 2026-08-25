import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import {
  addWorkoutExercise,
  cancelWorkout,
  completeWorkout,
  deleteWorkoutSet,
  getActiveWorkout,
  getWorkout,
  listWorkoutSessions,
  recordWorkoutSet,
  removeWorkoutExercise,
  startWorkout,
  updateWorkoutSet,
} from "@/lib/workout-sessions-api";
import { server } from "../../mocks/server";

const sessionId = "123e4567-e89b-12d3-a456-426614174000";
const performanceId = "223e4567-e89b-12d3-a456-426614174000";
const setId = "323e4567-e89b-12d3-a456-426614174000";
const exerciseId = "423e4567-e89b-12d3-a456-426614174000";

describe("workout-session API boundary", () => {
  it("serializes history filters and pagination", async () => {
    server.use(
      http.get("http://localhost:3000/api/workout-sessions", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("COMPLETED");
        expect(url.searchParams.get("from")).toBe("2026-08-01T00:00:00.000Z");
        expect(url.searchParams.get("to")).toBe("2026-08-31T23:59:59.000Z");
        expect(url.searchParams.get("limit")).toBe("20");
        expect(url.searchParams.get("offset")).toBe("10");
        return HttpResponse.json([]);
      }),
    );

    await expect(
      listWorkoutSessions({
        status: "COMPLETED",
        from: new Date("2026-08-01T00:00:00.000Z"),
        to: new Date("2026-08-31T23:59:59.000Z"),
        limit: 20,
        offset: 10,
      }),
    ).resolves.toEqual([]);
  });

  it("routes start and active-workout queries through the authenticated API boundary", async () => {
    server.use(
      http.post("http://localhost:3000/api/workout-sessions", async ({ request }) => {
        expect(await request.json()).toEqual({ timezone: "Asia/Qatar" });
        return HttpResponse.json({ id: sessionId, status: "IN_PROGRESS", version: 0 });
      }),
      http.get("http://localhost:3000/api/workout-sessions/active", () =>
        HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" }),
      ),
    );

    await expect(startWorkout({ timezone: "Asia/Qatar" })).resolves.toMatchObject({
      id: sessionId,
      status: "IN_PROGRESS",
    });
    await expect(getActiveWorkout()).resolves.toEqual({
      id: sessionId,
      status: "IN_PROGRESS",
    });
  });

  it("routes set entry, correction, deletion, completion, and cancellation commands", async () => {
    server.use(
      http.post(`http://localhost:3000/api/workout-sessions/${sessionId}/exercises`, async ({ request }) => {
        expect(await request.json()).toEqual({ exerciseId });
        return HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" });
      }),
      http.post(`http://localhost:3000/api/workout-sessions/${sessionId}/exercises/${performanceId}/sets`, async ({ request }) => {
        expect(await request.json()).toEqual({ repetitions: 10, load: "100", loadUnit: "KG" });
        return HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" });
      }),
      http.patch(`http://localhost:3000/api/workout-sessions/${sessionId}/exercises/${performanceId}/sets/${setId}`, async ({ request }) => {
        expect(await request.json()).toEqual({ repetitions: 9 });
        return HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" });
      }),
      http.delete(`http://localhost:3000/api/workout-sessions/${sessionId}/exercises/${performanceId}/sets/${setId}`, () =>
        HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" }),
      ),
      http.post(`http://localhost:3000/api/workout-sessions/${sessionId}/complete`, () =>
        HttpResponse.json({ id: sessionId, status: "COMPLETED" }),
      ),
      http.post(`http://localhost:3000/api/workout-sessions/${sessionId}/cancel`, () =>
        HttpResponse.json({ id: sessionId, status: "CANCELLED" }),
      ),
    );

    await expect(addWorkoutExercise(sessionId, { exerciseId })).resolves.toMatchObject({ id: sessionId });
    await expect(recordWorkoutSet(sessionId, performanceId, { repetitions: 10, load: "100", loadUnit: "KG" })).resolves.toMatchObject({ id: sessionId });
    await expect(updateWorkoutSet(sessionId, performanceId, setId, { repetitions: 9 })).resolves.toMatchObject({ id: sessionId });
    await expect(deleteWorkoutSet(sessionId, performanceId, setId)).resolves.toMatchObject({ id: sessionId });
    await expect(completeWorkout(sessionId)).resolves.toMatchObject({ status: "COMPLETED" });
    await expect(cancelWorkout(sessionId)).resolves.toMatchObject({ status: "CANCELLED" });
  });

  it("routes removing an exercise through the aggregate endpoint", async () => {
    server.use(
      http.delete(`http://localhost:3000/api/workout-sessions/${sessionId}/exercises`, async ({ request }) => {
        expect(await request.json()).toEqual({ exercisePerformanceId: performanceId });
        return HttpResponse.json({ id: sessionId, status: "IN_PROGRESS" });
      }),
    );

    await expect(removeWorkoutExercise(sessionId, { exercisePerformanceId: performanceId })).resolves.toMatchObject({ id: sessionId });
  });

  it("preserves ownership-safe API errors for the UI", async () => {
    server.use(
      http.get(`http://localhost:3000/api/workout-sessions/${sessionId}`, () =>
        HttpResponse.json({ message: "Workout session not found." }, { status: 404 }),
      ),
      http.post(`http://localhost:3000/api/workout-sessions/${sessionId}/complete`, () =>
        HttpResponse.json({ message: "The workout session changed before this operation completed." }, { status: 409 }),
      ),
    );

    await expect(getWorkout(sessionId)).rejects.toMatchObject({
      message: "Workout session not found.",
      status: 404,
    });
    await expect(completeWorkout(sessionId)).rejects.toMatchObject({
      message: "The workout session changed before this operation completed.",
      status: 409,
    });
  });
});
