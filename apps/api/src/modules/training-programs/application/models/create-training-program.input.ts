export type CreateTrainingProgramInput = {
  ownerId: string;
  name: string;
  slug?: string;
  description: string | null;
  durationWeeks: number;
  schedule?: Array<{
    routineSlug: string;
    weekNumber: number;
    dayNumber: number;
    notes?: string | null;
  }>;
};
