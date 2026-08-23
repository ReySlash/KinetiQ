import { serverRequest } from "@/lib/api/server-request";
import type { MuscleGroup, MuscleGroupDetails } from "@/types/muscle-types";

export function fetchMuscleGroups() {
  return serverRequest<MuscleGroup[]>("muscle-groups");
}

export function fetchMuscleGroup(slug: string) {
  return serverRequest<MuscleGroupDetails>(`muscle-groups/${slug}`);
}
