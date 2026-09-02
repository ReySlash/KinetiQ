import { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import type { AdoptedTrainingProgramDetailRow } from './prisma-adopted-training-program.mapper';
import {
  adoptedTrainingProgramSourceSelect,
  toCreateData,
  toDetail,
  toSource,
} from './prisma-adopted-training-program.mapper';
import { AdoptedTrainingProgramPersistenceStateError } from './prisma-adopted-training-program.errors';

const ownerId = '11111111-1111-4111-8111-111111111111';
const sourceProgramId = '22222222-2222-4222-8222-222222222222';
const sourceProgramRoutineId = '33333333-3333-4333-8333-333333333333';
const sourceRoutineId = '44444444-4444-4444-8444-444444444444';

describe('prisma adopted training program mapper', () => {
  it('maps domain values to nested adopted-program create data', () => {
    const program = AdoptedTrainingProgram.create({
      ownerId,
      sourceTrainingProgramId: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      durationWeeksSnapshot: 4,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      occurrences: [
        {
          sourceTrainingProgramRoutineId: sourceProgramRoutineId,
          sourceRoutineId,
          weekNumber: 1,
          dayNumber: 2,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: 'Controlled tempo',
        },
      ],
    });

    const data = toCreateData(program);

    expect(data).toMatchObject({
      id: program.id.value,
      owner: { connect: { id: ownerId } },
      sourceTrainingProgram: { connect: { id: sourceProgramId } },
      programNameSnapshot: 'Strength Base',
      durationWeeksSnapshot: 4,
      status: 'ACTIVE',
      occurrences: {
        create: [
          {
            sourceTrainingProgramRoutineId: sourceProgramRoutineId,
            sourceRoutineId,
            weekNumber: 1,
            dayNumber: 2,
            routineNameSnapshot: 'Upper A',
            programSlotNotesSnapshot: 'Controlled tempo',
            status: 'PENDING',
          },
        ],
      },
    });
  });

  it('preserves inaccessible routine snapshots while nulling the source routine id', () => {
    const row = {
      id: sourceProgramId,
      name: 'Shared Program',
      durationWeeks: 2,
      routines: [
        {
          id: sourceProgramRoutineId,
          weekNumber: 1,
          dayNumber: 1,
          notes: null,
          routine: {
            id: sourceRoutineId,
            name: 'Private Routine',
            ownerId: '55555555-5555-4555-8555-555555555555',
            visibility: 'PRIVATE' as const,
          },
        },
      ],
    } satisfies Parameters<typeof toSource>[0];

    expect(toSource(row, ownerId)).toEqual({
      id: sourceProgramId,
      name: 'Shared Program',
      durationWeeks: 2,
      schedule: [
        {
          id: sourceProgramRoutineId,
          routineId: null,
          routineName: 'Private Routine',
          weekNumber: 1,
          dayNumber: 1,
          notes: null,
        },
      ],
    });
    expect(adoptedTrainingProgramSourceSelect.routines.orderBy).toEqual([
      { weekNumber: 'asc' },
      { dayNumber: 'asc' },
    ]);
  });

  it('computes detail progress, next occurrence, source availability, and actions', () => {
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 2,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: { workoutSessions: [] },
      occurrences: [
        {
          id: sourceProgramRoutineId,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: null,
          status: 'PENDING' as const,
          sourceRoutineId,
          sourceRoutine: {
            id: sourceRoutineId,
            ownerId,
            visibility: 'PRIVATE' as const,
            exercises: [],
          },
          sessionAttempts: [],
        },
        {
          id: '66666666-6666-4666-8666-666666666666',
          weekNumber: 1,
          dayNumber: 2,
          routineNameSnapshot: 'Lower A',
          programSlotNotesSnapshot: null,
          status: 'COMPLETED' as const,
          sourceRoutineId: null,
          sourceRoutine: null,
          sessionAttempts: [
            {
              id: '77777777-7777-4777-8777-777777777777',
              status: 'COMPLETED' as const,
            },
          ],
        },
      ],
    } satisfies AdoptedTrainingProgramDetailRow;

    const detail = toDetail(row, ownerId);

    expect(detail).toMatchObject({
      totalCount: 2,
      completedCount: 1,
      skippedCount: 0,
      resolvedCount: 1,
      progressPercent: 50,
      nextPendingOccurrence: detail.occurrences[0],
      actions: {
        canPause: true,
        canResume: false,
        canCancel: true,
        canStartNext: true,
        canSkipNext: true,
      },
    });
    expect(detail.occurrences[1].sessionAttemptIds).toEqual([
      '77777777-7777-4777-8777-777777777777',
    ]);
    expect(detail.occurrences[1].latestSessionId).toBe(
      '77777777-7777-4777-8777-777777777777',
    );
  });

  it('does not advertise start or pause while an occurrence has an active session', () => {
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 2,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: { workoutSessions: [] },
      occurrences: [
        {
          id: sourceProgramRoutineId,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: null,
          status: 'IN_PROGRESS' as const,
          sourceRoutineId,
          sourceRoutine: {
            id: sourceRoutineId,
            ownerId,
            visibility: 'PRIVATE' as const,
            exercises: [],
          },
          sessionAttempts: [
            {
              id: '77777777-7777-4777-8777-777777777777',
              status: 'IN_PROGRESS' as const,
            },
          ],
        },
      ],
    } satisfies AdoptedTrainingProgramDetailRow;

    expect(toDetail(row, ownerId).actions).toEqual({
      canPause: false,
      canResume: false,
      canCancel: false,
      canStartNext: false,
      canSkipNext: false,
    });
  });

  it('does not advertise start while the owner has another active workout', () => {
    // Failure mode: BV-04
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 1,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: {
        workoutSessions: [{ id: '77777777-7777-4777-8777-777777777777' }],
      },
      occurrences: [occurrenceDetailRow()],
    } satisfies AdoptedTrainingProgramDetailRow;

    expect(toDetail(row, ownerId).actions).toMatchObject({
      canStartNext: false,
      canSkipNext: true,
    });
  });

  it('does not advertise start when the next routine contains an inactive exercise', () => {
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 1,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: { workoutSessions: [] },
      occurrences: [
        {
          id: sourceProgramRoutineId,
          weekNumber: 1,
          dayNumber: 1,
          routineNameSnapshot: 'Upper A',
          programSlotNotesSnapshot: null,
          status: 'PENDING' as const,
          sourceRoutineId,
          sourceRoutine: {
            id: sourceRoutineId,
            ownerId,
            visibility: 'PRIVATE' as const,
            exercises: [{ id: '55555555-5555-4555-8555-555555555555' }],
          },
          sessionAttempts: [],
        },
      ],
    };

    const detail = toDetail(row, ownerId);

    expect(detail.occurrences[0].sourceRoutineAvailable).toBe(false);
    expect(detail.actions.canStartNext).toBe(false);
    expect(detail.actions.canSkipNext).toBe(true);
  });

  it('rounds progress to exactly two decimal places', () => {
    // Failure mode: BC-05
    // Arrange
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 1,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: { workoutSessions: [] },
      occurrences: [
        occurrenceDetailRow({
          id: '55555555-5555-4555-8555-555555555555',
          dayNumber: 1,
          status: 'COMPLETED',
        }),
        occurrenceDetailRow({
          id: '66666666-6666-4666-8666-666666666666',
          dayNumber: 2,
        }),
        occurrenceDetailRow({
          id: '77777777-7777-4777-8777-777777777777',
          dayNumber: 3,
        }),
      ],
    } satisfies AdoptedTrainingProgramDetailRow;

    // Act
    const detail = toDetail(row, ownerId);

    // Assert
    expect(detail.progressPercent).toBe(33.33);
  });

  it('rejects a persisted adopted program with no occurrences as invalid state', () => {
    // Failure mode: NE-05
    // Arrange
    const row = {
      id: sourceProgramId,
      programNameSnapshot: 'Strength Base',
      status: 'ACTIVE' as const,
      durationWeeksSnapshot: 1,
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
      completedAt: null,
      cancelledAt: null,
      owner: { workoutSessions: [] },
      occurrences: [],
    } satisfies AdoptedTrainingProgramDetailRow;

    // Act
    const mapCorruptedProgram = () => toDetail(row, ownerId);

    // Assert
    expect(mapCorruptedProgram).toThrow(
      AdoptedTrainingProgramPersistenceStateError,
    );
  });
});

function occurrenceDetailRow(
  overrides: Partial<
    AdoptedTrainingProgramDetailRow['occurrences'][number]
  > = {},
): AdoptedTrainingProgramDetailRow['occurrences'][number] {
  return {
    id: sourceProgramRoutineId,
    weekNumber: 1,
    dayNumber: 1,
    routineNameSnapshot: 'Upper A',
    programSlotNotesSnapshot: null,
    status: 'PENDING',
    sourceRoutineId,
    sourceRoutine: {
      id: sourceRoutineId,
      ownerId,
      visibility: 'PRIVATE',
      exercises: [],
    },
    sessionAttempts: [],
    ...overrides,
  };
}
