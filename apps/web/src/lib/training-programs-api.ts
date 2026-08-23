import { clientRequest } from "@/lib/api/client-request";
import { ApiError as TrainingProgramApiError } from "@/lib/api/error";

export { TrainingProgramApiError };

export type TrainingProgramCreateInput = {
  name: string;
  description?: string | null;
  durationWeeks: number;
  schedule: {
    routineSlug: string;
    weekNumber: number;
    dayNumber: number;
    notes?: string | null;
  }[];
};

export function createTrainingProgram(input: TrainingProgramCreateInput) {
  return clientRequest<{ message: string; slug: string }>("training-programs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTrainingProgram(
  slug: string,
  input: TrainingProgramCreateInput,
) {
  return clientRequest<{ message: string; slug: string }>(`training-programs/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTrainingProgram(slug: string) {
  return clientRequest<{ message: string; slug: string }>(`training-programs/${slug}`, {
    method: "DELETE",
  });
}
