export const ROUTINE_SCOPES = ['my', 'global'] as const;
export type RoutineScope = (typeof ROUTINE_SCOPES)[number];

export const ROUTINE_SORTS = [
  'updatedAt:asc',
  'updatedAt:desc',
  'name:asc',
  'name:desc',
] as const;
export type RoutineSort = (typeof ROUTINE_SORTS)[number];

export type ListRoutinesInput = {
  ownerId?: string;
  scope?: RoutineScope;
  q?: string;
  sort?: RoutineSort;
  limit?: number;
  offset?: number;
};

export type ListRoutinesQuery =
  | {
      scope: 'my';
      ownerId: string;
      q?: string;
      sort: RoutineSort;
      limit: number;
      offset: number;
    }
  | {
      scope: 'global';
      q?: string;
      sort: RoutineSort;
      limit: number;
      offset: number;
    };

export type RoutineListItem = {
  slug: string;
  name: string;
  description: string | null;
  visibility: 'PRIVATE' | 'GLOBAL';
  updatedAt: Date;
  exerciseCount: number;
};
