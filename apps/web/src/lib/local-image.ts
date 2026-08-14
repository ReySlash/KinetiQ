export type LocalImageFeature = "exercises" | "muscles" | "muscle-groups";

export function getLocalImageSrc(
  feature: LocalImageFeature,
  slug: string,
): string {
  const folderByFeature: Record<LocalImageFeature, string> = {
    exercises: "Exercises",
    muscles: "Muscles",
    "muscle-groups": "Muscle-groups",
  };

  return `/temp/${folderByFeature[feature]}/${slug}.png`;
}
