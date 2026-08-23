import { serverRequest } from "@/lib/api/server-request";
import type { Muscle } from "@/types/muscle-types";

export function fetchMuscle(slug: string) {
  return serverRequest<Muscle>(`muscles/${slug}`);
}
