import { TrainingProgramScheduleValidationError } from '../errors/training-program.errors';
import { TrainingProgram } from './training-program.entity';

const base = {
  ownerId: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Strength Base',
  description: null,
  durationWeeks: 4,
};

describe('TrainingProgram schedule', () => {
  it('allows an empty schedule', () => {
    expect(TrainingProgram.create(base).schedule).toEqual([]);
  });

  it('orders entries by week and day while allowing a routine in multiple slots', () => {
    const program = TrainingProgram.create({
      ...base,
      schedule: [
        { routineSlug: 'upper-a', weekNumber: 2, dayNumber: 1 },
        { routineSlug: 'upper-a', weekNumber: 1, dayNumber: 2 },
      ],
    });
    expect(
      program.schedule.map(({ slot }) => [slot.weekNumber, slot.dayNumber]),
    ).toEqual([
      [1, 2],
      [2, 1],
    ]);
  });

  it.each([
    [[{ routineSlug: 'upper-a', weekNumber: 0, dayNumber: 1 }]],
    [[{ routineSlug: 'upper-a', weekNumber: 1, dayNumber: 0 }]],
    [[{ routineSlug: 'upper-a', weekNumber: 5, dayNumber: 1 }]],
    [
      [
        { routineSlug: 'upper-a', weekNumber: 1, dayNumber: 1 },
        { routineSlug: 'lower-a', weekNumber: 1, dayNumber: 1 },
      ],
    ],
  ])('rejects invalid schedule %p', (schedule) => {
    expect(() => TrainingProgram.create({ ...base, schedule })).toThrow(
      TrainingProgramScheduleValidationError,
    );
  });

  it('revalidates persisted schedule invariants during reconstitution', () => {
    expect(() =>
      TrainingProgram.reconstitute({
        id: '323e4567-e89b-12d3-a456-426614174000',
        ownerId: base.ownerId,
        slug: 'strength-base-12345678',
        name: base.name,
        description: null,
        visibility: 'PRIVATE',
        durationWeeks: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        schedule: [
          {
            id: '423e4567-e89b-12d3-a456-426614174000',
            routineSlug: 'upper-a',
            weekNumber: 2,
            dayNumber: 1,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    ).toThrow(TrainingProgramScheduleValidationError);
  });
});
