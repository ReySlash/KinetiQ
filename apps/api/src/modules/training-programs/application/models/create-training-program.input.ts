export type CreateTrainingProgramInput = {
  ownerId: string;
  name: string;
  slug?: string;
  description: string | null;
  durationWeeks: number;
};
