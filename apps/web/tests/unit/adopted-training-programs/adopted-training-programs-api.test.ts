import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  adoptTrainingProgram,
  cancelAdoptedTrainingProgram,
  getActiveAdoptedTrainingProgram,
  getAdoptedTrainingProgram,
  pauseAdoptedTrainingProgram,
  resumeAdoptedTrainingProgram,
  skipProgramWorkout,
  startProgramWorkout,
} from "@/lib/adopted-training-programs-api";
import { server } from "../../mocks/server";

const programId = "123e4567-e89b-12d3-a456-426614174000";
const occurrenceId = "223e4567-e89b-12d3-a456-426614174000";
const sessionId = "323e4567-e89b-12d3-a456-426614174000";

describe("adopted training program API", () => {
  it("reads the active program and an ownership-scoped detail", async () => {
    server.use(
      http.get("http://localhost:3000/api/user-training-programs/active", () =>
        HttpResponse.json(null),
      ),
      http.get(
        `http://localhost:3000/api/user-training-programs/${programId}`,
        () => HttpResponse.json({ id: programId, status: "ACTIVE" }),
      ),
    );

    await expect(getActiveAdoptedTrainingProgram()).resolves.toBeNull();
    await expect(getAdoptedTrainingProgram(programId)).resolves.toMatchObject({
      id: programId,
      status: "ACTIVE",
    });
  });

  it("adopts and runs every lifecycle mutation through canonical endpoints", async () => {
    server.use(
      http.post("http://localhost:3000/api/user-training-programs", async ({ request }) => {
        expect(await request.json()).toEqual({ sourceProgramSlug: "strength-base" });
        return HttpResponse.json({ id: programId, status: "ACTIVE" }, { status: 201 });
      }),
      ...["pause", "resume", "cancel"].map((action) =>
        http.post(
          `http://localhost:3000/api/user-training-programs/${programId}/${action}`,
          () => HttpResponse.json({ id: programId, status: "ACTIVE" }),
        ),
      ),
      http.post(
        `http://localhost:3000/api/user-training-programs/${programId}/workouts/${occurrenceId}/skip`,
        () => HttpResponse.json({ id: programId, status: "ACTIVE" }),
      ),
      http.post(
        `http://localhost:3000/api/user-training-programs/${programId}/workouts/${occurrenceId}/start`,
        async ({ request }) => {
          expect(await request.json()).toEqual({ timezone: "Asia/Qatar" });
          return HttpResponse.json(
            {
              workoutSessionId: sessionId,
              occurrenceId,
              sessionStatus: "IN_PROGRESS",
              occurrenceStatus: "IN_PROGRESS",
            },
            { status: 201 },
          );
        },
      ),
    );

    await expect(adoptTrainingProgram("strength-base")).resolves.toMatchObject({ id: programId });
    await expect(pauseAdoptedTrainingProgram(programId)).resolves.toMatchObject({ id: programId });
    await expect(resumeAdoptedTrainingProgram(programId)).resolves.toMatchObject({ id: programId });
    await expect(cancelAdoptedTrainingProgram(programId)).resolves.toMatchObject({ id: programId });
    await expect(skipProgramWorkout(programId, occurrenceId)).resolves.toMatchObject({ id: programId });
    await expect(startProgramWorkout(programId, occurrenceId, { timezone: "Asia/Qatar" })).resolves.toMatchObject({
      workoutSessionId: sessionId,
    });
  });

  it("accepts every successful 2xx response", async () => {
    server.use(
      http.post("http://localhost:3000/api/user-training-programs", () =>
        HttpResponse.json({ id: programId, status: "ACTIVE" }, { status: 200 }),
      ),
      http.post(
        `http://localhost:3000/api/user-training-programs/${programId}/pause`,
        () => HttpResponse.json({ id: programId, status: "PAUSED" }, { status: 201 }),
      ),
    );

    await expect(adoptTrainingProgram("strength-base")).resolves.toMatchObject({ id: programId });
    await expect(pauseAdoptedTrainingProgram(programId)).resolves.toMatchObject({ status: "PAUSED" });
  });
});
