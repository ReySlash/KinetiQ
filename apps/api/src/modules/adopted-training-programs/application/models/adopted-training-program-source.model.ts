export type AdoptedTrainingProgramSource = {
  id: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'GLOBAL';
  durationWeeks: number;
  readonly schedule: readonly AdoptedTrainingProgramSourceScheduleItem[];
};

export type AdoptedTrainingProgramSourceScheduleItem = {
  id: string;
  routineId: string | null;
  routineName: string;
  weekNumber: number;
  dayNumber: number;
  notes: string | null;
};
