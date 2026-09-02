import { Prisma } from '../../../../../generated/prisma/client';
import type {
  ExerciseHistoryItem,
  WorkoutSessionDetail,
  WorkoutSessionListItem,
  WorkoutSessionProvenance,
} from '../../application/models/workout-session-query.model';
import { WorkoutSession } from '../../domain/entities/workout-session.entity';
import type {
  PrimitiveCompletedSet,
  PrimitiveExercisePerformance,
  PrimitiveWorkoutSession,
} from '../../domain/entities/workout-session.types';
import type { CompletedSet } from '../../domain/entities/completed-set.entity';
import type { ExercisePerformance } from '../../domain/entities/exercise-performance.entity';

export const workoutSessionAggregateSelect = {
  id: true,
  ownerId: true,
  sourceRoutineId: true,
  sourceRoutineNameSnapshot: true,
  status: true,
  timezone: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  performances: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      workoutSessionId: true,
      exerciseId: true,
      sourceRoutineExerciseId: true,
      order: true,
      exerciseNameSnapshot: true,
      targetSetCount: true,
      targetMinReps: true,
      targetMaxReps: true,
      targetRir: true,
      targetRestSeconds: true,
      targetTempo: true,
      prescriptionNotes: true,
      createdAt: true,
      updatedAt: true,
      completedSets: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          exercisePerformanceId: true,
          order: true,
          repetitions: true,
          loadKg: true,
          loadUnit: true,
          rir: true,
          isWarmup: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} satisfies Prisma.WorkoutSessionSelect;

export type WorkoutSessionAggregateRow = Prisma.WorkoutSessionGetPayload<{
  select: typeof workoutSessionAggregateSelect;
}>;

const programWorkoutOccurrenceSelect = {
  id: true,
  weekNumber: true,
  dayNumber: true,
  routineNameSnapshot: true,
  adoptedTrainingProgram: {
    select: { id: true, programNameSnapshot: true },
  },
} satisfies Prisma.ProgramWorkoutOccurrenceSelect;

export const workoutSessionDetailSelect = {
  id: true,
  status: true,
  sourceRoutineId: true,
  sourceRoutineNameSnapshot: true,
  programWorkoutOccurrence: { select: programWorkoutOccurrenceSelect },
  timezone: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
  performances: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      exerciseId: true,
      exerciseNameSnapshot: true,
      order: true,
      targetSetCount: true,
      targetMinReps: true,
      targetMaxReps: true,
      targetRir: true,
      targetRestSeconds: true,
      targetTempo: true,
      prescriptionNotes: true,
      completedSets: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          repetitions: true,
          loadKg: true,
          loadUnit: true,
          rir: true,
          isWarmup: true,
          completedAt: true,
        },
      },
    },
  },
} satisfies Prisma.WorkoutSessionSelect;

export type WorkoutSessionDetailRow = Prisma.WorkoutSessionGetPayload<{
  select: typeof workoutSessionDetailSelect;
}>;

export const workoutSessionListSelect = {
  id: true,
  status: true,
  sourceRoutineId: true,
  sourceRoutineNameSnapshot: true,
  programWorkoutOccurrence: { select: programWorkoutOccurrenceSelect },
  timezone: true,
  startedAt: true,
  completedAt: true,
  cancelledAt: true,
  updatedAt: true,
  performances: {
    select: { completedSets: { select: { id: true } } },
  },
} satisfies Prisma.WorkoutSessionSelect;

export type WorkoutSessionListRow = Prisma.WorkoutSessionGetPayload<{
  select: typeof workoutSessionListSelect;
}>;

export const exerciseHistorySelect = {
  id: true,
  workoutSessionId: true,
  exerciseId: true,
  exerciseNameSnapshot: true,
  order: true,
  targetSetCount: true,
  targetMinReps: true,
  targetMaxReps: true,
  targetRir: true,
  targetRestSeconds: true,
  targetTempo: true,
  prescriptionNotes: true,
  completedSets: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      order: true,
      repetitions: true,
      loadKg: true,
      loadUnit: true,
      rir: true,
      isWarmup: true,
      completedAt: true,
    },
  },
  workoutSession: {
    select: {
      status: true,
      startedAt: true,
      sourceRoutineId: true,
      programWorkoutOccurrence: { select: programWorkoutOccurrenceSelect },
    },
  },
} satisfies Prisma.ExercisePerformanceSelect;

export type ExerciseHistoryRow = Prisma.ExercisePerformanceGetPayload<{
  select: typeof exerciseHistorySelect;
}>;

export function toCreateData(
  workout: WorkoutSession,
): Prisma.WorkoutSessionUncheckedCreateInput {
  const value = workout.toValue();
  return {
    id: value.id,
    ownerId: value.ownerId,
    sourceRoutineId: value.sourceRoutineId,
    sourceRoutineNameSnapshot: value.sourceRoutineNameSnapshot,
    status: value.status,
    timezone: value.timezone,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    cancelledAt: value.cancelledAt,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    version: value.version,
  };
}

export function toExercisePerformanceCreateData(
  performance: ExercisePerformance,
): Prisma.ExercisePerformanceUncheckedCreateInput {
  return toExercisePerformanceCreateManyData(performance.toValue());
}

export function toNestedExercisePerformanceCreateData(
  performance: PrimitiveExercisePerformance,
): Prisma.ExercisePerformanceCreateWithoutWorkoutSessionInput {
  return {
    id: performance.id,
    order: performance.order,
    exerciseNameSnapshot: performance.exerciseNameSnapshot,
    targetSetCount: performance.targetSetCount,
    targetMinReps: performance.targetMinReps,
    targetMaxReps: performance.targetMaxReps,
    targetRir: performance.targetRir,
    targetRestSeconds: performance.targetRestSeconds,
    targetTempo: performance.targetTempo,
    prescriptionNotes: performance.prescriptionNotes,
    createdAt: performance.createdAt,
    updatedAt: performance.updatedAt,
    exercise: { connect: { id: performance.exerciseId } },
    sourceRoutineExercise: performance.sourceRoutineExerciseId
      ? { connect: { id: performance.sourceRoutineExerciseId } }
      : undefined,
    completedSets: {
      create: performance.completedSets.map(toNestedCompletedSetCreateData),
    },
  };
}

export function toExercisePerformanceCreateManyData(
  performance: PrimitiveExercisePerformance,
): Prisma.ExercisePerformanceCreateManyInput {
  return {
    ...toExercisePerformanceScalarData(performance),
    workoutSessionId: performance.workoutSessionId,
  };
}

function toExercisePerformanceScalarData(
  performance: PrimitiveExercisePerformance,
) {
  return {
    id: performance.id,
    exerciseId: performance.exerciseId,
    sourceRoutineExerciseId: performance.sourceRoutineExerciseId,
    order: performance.order,
    exerciseNameSnapshot: performance.exerciseNameSnapshot,
    targetSetCount: performance.targetSetCount,
    targetMinReps: performance.targetMinReps,
    targetMaxReps: performance.targetMaxReps,
    targetRir: performance.targetRir,
    targetRestSeconds: performance.targetRestSeconds,
    targetTempo: performance.targetTempo,
    prescriptionNotes: performance.prescriptionNotes,
    createdAt: performance.createdAt,
    updatedAt: performance.updatedAt,
  };
}

export function toCompletedSetCreateData(
  completedSet: CompletedSet,
): Prisma.CompletedSetUncheckedCreateInput {
  return toCompletedSetCreateManyData(completedSet.toValue());
}

export function toNestedCompletedSetCreateData(
  completedSet: PrimitiveCompletedSet,
): Prisma.CompletedSetCreateWithoutExercisePerformanceInput {
  const data = toCompletedSetCreateManyData(completedSet);
  return {
    id: data.id,
    order: data.order,
    repetitions: data.repetitions,
    loadKg: data.loadKg,
    loadUnit: data.loadUnit,
    rir: data.rir,
    isWarmup: data.isWarmup,
    completedAt: data.completedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function toCompletedSetCreateManyData(
  completedSet: PrimitiveCompletedSet,
): Prisma.CompletedSetCreateManyInput {
  return {
    id: completedSet.id,
    exercisePerformanceId: completedSet.exercisePerformanceId,
    order: completedSet.order,
    repetitions: completedSet.repetitions,
    loadKg: new Prisma.Decimal(completedSet.loadKg),
    loadUnit: completedSet.loadUnit,
    rir: completedSet.rir,
    isWarmup: completedSet.isWarmup,
    completedAt: completedSet.completedAt,
    createdAt: completedSet.createdAt,
    updatedAt: completedSet.updatedAt,
  };
}

export function toUpdateData(
  workout: WorkoutSession,
): Prisma.WorkoutSessionUncheckedUpdateManyInput {
  const value = workout.toValue();
  return {
    sourceRoutineId: value.sourceRoutineId,
    sourceRoutineNameSnapshot: value.sourceRoutineNameSnapshot,
    status: value.status,
    timezone: value.timezone,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    cancelledAt: value.cancelledAt,
    updatedAt: value.updatedAt,
    version: value.version,
  };
}

function decimalToString(value: Prisma.Decimal | string): string {
  return value.toString();
}

export function toDomain(
  row: WorkoutSessionAggregateRow | PrimitiveWorkoutSession,
): WorkoutSession {
  const performances =
    'performances' in row ? row.performances : row.exercisePerformances;
  return WorkoutSession.reconstitute({
    id: row.id,
    ownerId: row.ownerId,
    sourceRoutineId: row.sourceRoutineId,
    sourceRoutineNameSnapshot: row.sourceRoutineNameSnapshot,
    status: row.status,
    timezone: row.timezone,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    version: row.version,
    exercisePerformances: performances.map((performance) => ({
      id: performance.id,
      workoutSessionId: performance.workoutSessionId,
      exerciseId: performance.exerciseId,
      sourceRoutineExerciseId: performance.sourceRoutineExerciseId,
      order: performance.order,
      exerciseNameSnapshot: performance.exerciseNameSnapshot,
      targetSetCount: performance.targetSetCount,
      targetMinReps: performance.targetMinReps,
      targetMaxReps: performance.targetMaxReps,
      targetRir: performance.targetRir,
      targetRestSeconds: performance.targetRestSeconds,
      targetTempo: performance.targetTempo,
      prescriptionNotes: performance.prescriptionNotes,
      createdAt: performance.createdAt,
      updatedAt: performance.updatedAt,
      completedSets: performance.completedSets.map((set) => ({
        id: set.id,
        exercisePerformanceId: set.exercisePerformanceId,
        order: set.order,
        repetitions: set.repetitions,
        loadKg: decimalToString(set.loadKg),
        loadUnit: set.loadUnit,
        rir: set.rir,
        isWarmup: set.isWarmup,
        completedAt: set.completedAt,
        createdAt: set.createdAt,
        updatedAt: set.updatedAt,
      })),
    })),
  });
}

export function toDetail(row: WorkoutSessionDetailRow): WorkoutSessionDetail {
  return {
    id: row.id,
    status: row.status,
    sourceRoutineId: row.sourceRoutineId,
    sourceRoutineNameSnapshot: row.sourceRoutineNameSnapshot,
    provenance: toProvenance(row.sourceRoutineId, row.programWorkoutOccurrence),
    timezone: row.timezone,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    performances: row.performances.map((performance) => ({
      id: performance.id,
      exerciseId: performance.exerciseId,
      exerciseNameSnapshot: performance.exerciseNameSnapshot,
      order: performance.order,
      targetSetCount: performance.targetSetCount,
      targetMinReps: performance.targetMinReps,
      targetMaxReps: performance.targetMaxReps,
      targetRir: performance.targetRir,
      targetRestSeconds: performance.targetRestSeconds,
      targetTempo: performance.targetTempo,
      prescriptionNotes: performance.prescriptionNotes,
      completedSets: performance.completedSets.map((set) => ({
        ...set,
        loadKg: decimalToString(set.loadKg),
      })),
    })),
  };
}

export function toListItem(row: WorkoutSessionListRow): WorkoutSessionListItem {
  return {
    id: row.id,
    status: row.status,
    sourceRoutineNameSnapshot: row.sourceRoutineNameSnapshot,
    provenance: toProvenance(row.sourceRoutineId, row.programWorkoutOccurrence),
    timezone: row.timezone,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    updatedAt: row.updatedAt,
    completedSetCount: row.performances.reduce(
      (count, performance) => count + performance.completedSets.length,
      0,
    ),
  };
}

export function toExerciseHistoryItem(
  row: ExerciseHistoryRow,
): ExerciseHistoryItem {
  return {
    workoutSessionId: row.workoutSessionId,
    sessionStatus: row.workoutSession.status,
    sessionStartedAt: row.workoutSession.startedAt,
    provenance: toProvenance(
      row.workoutSession.sourceRoutineId,
      row.workoutSession.programWorkoutOccurrence,
    ),
    exercisePerformanceId: row.id,
    exerciseNameSnapshot: row.exerciseNameSnapshot,
    prescription: {
      targetSetCount: row.targetSetCount,
      targetMinReps: row.targetMinReps,
      targetMaxReps: row.targetMaxReps,
      targetRir: row.targetRir,
      targetRestSeconds: row.targetRestSeconds,
      targetTempo: row.targetTempo,
      prescriptionNotes: row.prescriptionNotes,
    },
    completedSets: row.completedSets.map((set) => ({
      ...set,
      loadKg: decimalToString(set.loadKg),
    })),
  };
}

function toProvenance(
  sourceRoutineId: string | null,
  occurrence: {
    id: string;
    weekNumber: number;
    dayNumber: number;
    routineNameSnapshot: string;
    adoptedTrainingProgram: { id: string; programNameSnapshot: string };
  } | null,
): WorkoutSessionProvenance {
  if (occurrence) {
    return {
      sourceKind: 'PROGRAM_WORKOUT',
      adoptedTrainingProgramId: occurrence.adoptedTrainingProgram.id,
      programWorkoutOccurrenceId: occurrence.id,
      programNameSnapshot:
        occurrence.adoptedTrainingProgram.programNameSnapshot,
      programWeekNumber: occurrence.weekNumber,
      programDayNumber: occurrence.dayNumber,
      programRoutineNameSnapshot: occurrence.routineNameSnapshot,
    };
  }
  return {
    sourceKind: sourceRoutineId ? 'ROUTINE' : 'FREESTYLE',
    adoptedTrainingProgramId: null,
    programWorkoutOccurrenceId: null,
    programNameSnapshot: null,
    programWeekNumber: null,
    programDayNumber: null,
    programRoutineNameSnapshot: null,
  };
}
