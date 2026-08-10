export type TrainingProgramVisibility = 'PRIVATE' | 'GLOBAL';

export type PrimitiveTrainingProgram = {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description: string | null;
  visibility: TrainingProgramVisibility;
  durationWeeks: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTrainingProgramAttributes = {
  ownerId: string;
  name: string;
  slug?: string;
  description: string | null;
  durationWeeks: number;
};
