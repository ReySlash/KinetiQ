import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicRequest: vi.fn(),
  privateRequest: vi.fn(),
}));

vi.mock("@/lib/api/server-request", () => ({
  publicServerRequest: mocks.publicRequest,
  serverRequest: mocks.privateRequest,
}));

import { fetchExercise, fetchExercises } from "@/lib/exercises-server";
import { fetchMuscleGroup, fetchMuscleGroups } from "@/lib/muscle-groups-server";
import { fetchRoutine, fetchRoutines } from "@/lib/routines-server";
import { fetchTrainingProgram, fetchTrainingPrograms } from "@/lib/training-programs-server";

describe("catalog server loaders", () => {
  beforeEach(() => {
    mocks.publicRequest.mockReset().mockResolvedValue([]);
    mocks.privateRequest.mockReset().mockResolvedValue([]);
  });

  it("uses public caching for exercise and muscle-group lists", async () => {
    await fetchExercises({ q: "press", sort: "name" });
    await fetchMuscleGroups();

    expect(mocks.publicRequest).toHaveBeenNthCalledWith(
      1,
      "exercises?q=press&sort=name",
    );
    expect(mocks.publicRequest).toHaveBeenNthCalledWith(2, "muscle-groups");
    expect(mocks.privateRequest).not.toHaveBeenCalled();
  });

  it("uses public caching for global lists and private transport for my lists", async () => {
    await fetchRoutines({ scope: "global", q: "upper" });
    await fetchRoutines({ scope: "my", q: "upper" });
    await fetchTrainingPrograms({ scope: "global", sort: "name" });
    await fetchTrainingPrograms({ scope: "my", sort: "name" });

    expect(mocks.publicRequest).toHaveBeenCalledWith("routines?limit=100&offset=0&scope=global&q=upper");
    expect(mocks.publicRequest).toHaveBeenCalledWith("training-programs?limit=20&offset=0&scope=global&sort=name");
    expect(mocks.privateRequest).toHaveBeenCalledWith("routines?limit=100&offset=0&scope=my&q=upper");
    expect(mocks.privateRequest).toHaveBeenCalledWith("training-programs?limit=20&offset=0&scope=my&sort=name");
  });

  it("keeps detail loaders on the private transport", async () => {
    await fetchExercise("bench-press");
    await fetchMuscleGroup("chest");
    await fetchRoutine("upper-a");
    await fetchTrainingProgram("strength");

    expect(mocks.privateRequest).toHaveBeenCalledWith("exercises/bench-press");
    expect(mocks.privateRequest).toHaveBeenCalledWith("muscle-groups/chest");
    expect(mocks.privateRequest).toHaveBeenCalledWith("routines/upper-a");
    expect(mocks.privateRequest).toHaveBeenCalledWith("training-programs/strength");
    expect(mocks.publicRequest).not.toHaveBeenCalled();
  });
});
