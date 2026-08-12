export type UpdateTrainingProgramInput = {
  ownerId: string;
  slug: string;
  name?: string;
  description?: string | null;
  durationWeeks?: number;
  schedule?: Array<{
    routineSlug: string;
    weekNumber: number;
    dayNumber: number;
    notes?: string | null;
  }>;
};
