export type AdoptedTrainingProgramSource = {
  id: string;
  name: string;
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
