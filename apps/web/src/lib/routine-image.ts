const routineCoverSlugs = new Set([
  "full-body-a",
  "full-body-b",
  "full-body-c",
  "total-body-strength",
  "legs",
  "power",
  "pull",
  "push",
  "lower-body",
  "upper-body",
]);

export const ROUTINE_IMAGE_FALLBACK = "/assets/empty-state-exercises.webp";
export const ROUTINE_IMAGE_VERSION = "2";

function normalizeRoutineName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRoutineCoverSrc(name: string): string | null {
  const slug = normalizeRoutineName(name);
  return routineCoverSlugs.has(slug)
    ? `/assets/Covers/${slug}.webp?v=${ROUTINE_IMAGE_VERSION}`
    : null;
}
