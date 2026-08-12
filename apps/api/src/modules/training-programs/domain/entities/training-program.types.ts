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
  schedule: PrimitiveTrainingProgramScheduleEntry[];
};

export type PrimitiveTrainingProgramScheduleEntry = {
  id: string;
  routineSlug: string;
  weekNumber: number;
  dayNumber: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTrainingProgramScheduleEntryAttributes = {
  routineSlug: string;
  weekNumber: number;
  dayNumber: number;
  notes?: string | null;
};

export type CreateTrainingProgramAttributes = {
  ownerId: string;
  name: string;
  slug?: string;
  description: string | null;
  durationWeeks: number;
  schedule?: CreateTrainingProgramScheduleEntryAttributes[];
};

export type UpdateTrainingProgramAttributes = {
  name?: string;
  description?: string | null;
  durationWeeks?: number;
  schedule?: CreateTrainingProgramScheduleEntryAttributes[];
};
