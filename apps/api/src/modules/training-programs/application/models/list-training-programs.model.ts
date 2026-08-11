export const TRAINING_PROGRAM_SCOPES = ['my', 'global'] as const;
export type TrainingProgramScope = (typeof TRAINING_PROGRAM_SCOPES)[number];

export const TRAINING_PROGRAM_SORTS = [
  'updatedAt:asc',
  'updatedAt:desc',
  'name:asc',
  'name:desc',
] as const;
export type TrainingProgramSort = (typeof TRAINING_PROGRAM_SORTS)[number];

export type ListTrainingProgramsInput = {
  principal: { userId: string } | null;
  scope?: TrainingProgramScope;
  q?: string;
  sort?: TrainingProgramSort;
  limit?: number;
  offset?: number;
};

export type TrainingProgramListItem = {
  slug: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'GLOBAL';
  durationWeeks: number;
  updatedAt: Date;
};

type ListTrainingProgramsQueryOptions = {
  q?: string;
  sort: TrainingProgramSort;
  limit: number;
  offset: number;
};

export type ListTrainingProgramsQuery =
  | (ListTrainingProgramsQueryOptions & {
      scope: 'my';
      ownerId: string;
    })
  | (ListTrainingProgramsQueryOptions & {
      scope: 'global';
      ownerId?: never;
    });
