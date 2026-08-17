export type TrainingProgramScope = "my" | "global";

export type TrainingProgramSort =
  | "updatedAt:asc"
  | "updatedAt:desc"
  | "name:asc"
  | "name:desc";

export type TrainingProgramListItem = {
  slug: string;
  name: string;
  description: string | null;
  visibility: "PRIVATE" | "GLOBAL";
  durationWeeks: number;
  updatedAt: string;
};

export type TrainingProgramDetail = TrainingProgramListItem & {
  schedule: {
    weekNumber: number;
    dayNumber: number;
    notes: string | null;
    routine: {
      slug: string;
      name: string;
      visibility: "PRIVATE" | "GLOBAL";
    };
  }[];
};
