export type TrainingProgramDetailScheduleItem = {
  weekNumber: number;
  dayNumber: number;
  notes: string | null;
  routine: {
    slug: string;
    name: string;
    visibility: 'PRIVATE' | 'GLOBAL';
  };
};

export type TrainingProgramDetail = {
  slug: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'GLOBAL';
  durationWeeks: number;
  updatedAt: Date;
  schedule: TrainingProgramDetailScheduleItem[];
};

export type GetTrainingProgramQuery = {
  slug: string;
  ownerId?: string;
};
