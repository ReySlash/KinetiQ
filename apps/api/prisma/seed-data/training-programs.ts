import type {
  TrainingProgramScheduleSeed,
  TrainingProgramSeed,
} from './types';

function expandWeeklySchedule(
  durationWeeks: number,
  weeklySchedule: readonly Omit<
    TrainingProgramScheduleSeed,
    'weekNumber'
  >[],
): readonly TrainingProgramScheduleSeed[] {
  return Array.from({ length: durationWeeks }, (_, weekIndex) =>
    weeklySchedule.map((entry) => ({
      ...entry,
      weekNumber: weekIndex + 1,
    })),
  ).flat();
}

const fullBodyFoundationSchedule = [
  { routineKey: 'full-body-a', dayNumber: 1 },
  { routineKey: 'full-body-b', dayNumber: 3 },
  { routineKey: 'full-body-c', dayNumber: 5 },
] as const;

const upperLowerSchedule = [
  { routineKey: 'upper-body', dayNumber: 1 },
  { routineKey: 'lower-body', dayNumber: 2 },
  { routineKey: 'upper-body', dayNumber: 4 },
  { routineKey: 'lower-body', dayNumber: 5 },
] as const;

const pushPullLegsSchedule = [
  { routineKey: 'push', dayNumber: 1 },
  { routineKey: 'pull', dayNumber: 2 },
  { routineKey: 'legs', dayNumber: 3 },
  { routineKey: 'push', dayNumber: 4 },
  { routineKey: 'pull', dayNumber: 5 },
  { routineKey: 'legs', dayNumber: 6 },
] as const;

const threeDayStrengthSchedule = [
  { routineKey: 'total-body-strength', dayNumber: 1 },
  { routineKey: 'full-body-a', dayNumber: 3 },
  { routineKey: 'total-body-strength', dayNumber: 5 },
] as const;

const fiveDayTrainingSchedule = [
  { routineKey: 'upper-body', dayNumber: 1 },
  { routineKey: 'lower-body', dayNumber: 2 },
  { routineKey: 'push', dayNumber: 3 },
  { routineKey: 'pull', dayNumber: 4 },
  { routineKey: 'legs', dayNumber: 5 },
] as const;

export const globalTrainingPrograms: readonly TrainingProgramSeed[] = [
  {
    key: 'full-body-foundation',
    name: 'Full-Body Foundation',
    description:
      'An eight-week, three-day full-body template for building a consistent training base.',
    durationWeeks: 8,
    schedule: expandWeeklySchedule(8, fullBodyFoundationSchedule),
  },
  {
    key: 'upper-lower-foundation',
    name: 'Upper/Lower Foundation',
    description:
      'An eight-week, four-day upper/lower template balancing strength and hypertrophy-focused training.',
    durationWeeks: 8,
    schedule: expandWeeklySchedule(8, upperLowerSchedule),
  },
  {
    key: 'push-pull-legs',
    name: 'Push/Pull/Legs',
    description:
      'A six-week, six-day push/pull/legs template for higher-frequency training.',
    durationWeeks: 6,
    schedule: expandWeeklySchedule(6, pushPullLegsSchedule),
  },
  {
    key: 'three-day-strength-base',
    name: 'Three-Day Strength Base',
    description:
      'An eight-week, three-day template centered on compound strength work and full-body practice.',
    durationWeeks: 8,
    schedule: expandWeeklySchedule(8, threeDayStrengthSchedule),
  },
  {
    key: 'five-day-training-base',
    name: 'Five-Day Training Base',
    description:
      'A six-week, five-day template combining upper/lower and body-part-focused sessions.',
    durationWeeks: 6,
    schedule: expandWeeklySchedule(6, fiveDayTrainingSchedule),
  },
];
