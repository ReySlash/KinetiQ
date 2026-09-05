import { MuscleRole } from '../../generated/prisma/client';
import { equipment } from '../seed-data/equipment';
import { exerciseCategories, exercises } from '../seed-data/exercises';
import { muscleFunctionAssignments } from '../seed-data/muscle-function-assignments';
import { muscleFunctions } from '../seed-data/muscle-functions';
import { muscleGroups } from '../seed-data/muscle-groups';
import { childMuscles, parentMuscles } from '../seed-data/muscles';
import { movementPatterns } from '../seed-data/movement-patterns';
import { globalRoutines } from '../seed-data/routines';
import { globalTrainingPrograms } from '../seed-data/training-programs';
import type {
  ExerciseCapabilitySeed,
  ExerciseDemandSeed,
  ExerciseSeed,
} from '../seed-data/types';
import { assertRequiredText, assertUniqueSlugs } from './helpers';

const SCORE_MIN = 0;
const SCORE_MAX = 5;

function validateScore(
  exerciseSlug: string,
  fieldName: string,
  value: number,
): void {
  if (!Number.isInteger(value) || value < SCORE_MIN || value > SCORE_MAX) {
    throw new Error(
      `Exercise "${exerciseSlug}" has invalid score for "${fieldName}": ${value}. Expected an integer from ${SCORE_MIN} to ${SCORE_MAX}.`,
    );
  }
}

function validateProfile(
  exerciseSlug: string,
  profile: ExerciseCapabilitySeed | ExerciseDemandSeed,
  profileName: string,
): void {
  for (const [fieldName, value] of Object.entries(profile)) {
    if (fieldName === 'editorialNotes') {
      continue;
    }

    if (typeof value === 'number') {
      validateScore(exerciseSlug, `${profileName}.${fieldName}`, value);
    }
  }
}

function assertKnownReference(
  knownSlugs: ReadonlySet<string>,
  referencedSlug: string,
  referencedEntity: string,
  exerciseSlug: string,
): void {
  if (!knownSlugs.has(referencedSlug)) {
    throw new Error(
      `Exercise "${exerciseSlug}" references unknown ${referencedEntity} slug "${referencedSlug}".`,
    );
  }
}

function validateExercise(
  exercise: ExerciseSeed,
  muscleSlugs: ReadonlySet<string>,
  equipmentSlugs: ReadonlySet<string>,
  movementPatternSlugs: ReadonlySet<string>,
): void {
  assertRequiredText(exercise.name, `Exercise "${exercise.slug}" name`);
  assertRequiredText(exercise.slug, 'Exercise slug');
  assertRequiredText(
    exercise.description,
    `Exercise "${exercise.slug}" description`,
  );
  assertRequiredText(
    exercise.instructions,
    `Exercise "${exercise.slug}" instructions`,
  );
  assertRequiredText(
    exercise.commonMistakes,
    `Exercise "${exercise.slug}" commonMistakes`,
  );
  assertRequiredText(
    exercise.imageAltText,
    `Exercise "${exercise.slug}" imageAltText`,
  );

  assertKnownReference(
    movementPatternSlugs,
    exercise.movementPatternSlug,
    'movement pattern',
    exercise.slug,
  );

  if (exercise.equipmentSlugs.length === 0) {
    throw new Error(
      `Exercise "${exercise.slug}" must reference at least one equipment record.`,
    );
  }

  const seenEquipment = new Set<string>();

  for (const equipmentSlug of exercise.equipmentSlugs) {
    assertKnownReference(
      equipmentSlugs,
      equipmentSlug,
      'equipment',
      exercise.slug,
    );

    if (seenEquipment.has(equipmentSlug)) {
      throw new Error(
        `Exercise "${exercise.slug}" contains duplicate equipment relation "${equipmentSlug}".`,
      );
    }

    seenEquipment.add(equipmentSlug);
  }

  const seenMuscles = new Set<string>();
  let primaryCount = 0;

  for (const muscle of exercise.muscles) {
    assertKnownReference(
      muscleSlugs,
      muscle.muscleSlug,
      'muscle',
      exercise.slug,
    );

    if (seenMuscles.has(muscle.muscleSlug)) {
      throw new Error(
        `Exercise "${exercise.slug}" contains duplicate muscle relation "${muscle.muscleSlug}".`,
      );
    }

    seenMuscles.add(muscle.muscleSlug);
    validateScore(
      exercise.slug,
      `muscles.${muscle.muscleSlug}.involvementScore`,
      muscle.involvementScore,
    );

    if (muscle.involvementScore === 0) {
      throw new Error(
        `Exercise "${exercise.slug}" cannot create muscle relation "${muscle.muscleSlug}" with involvement score 0.`,
      );
    }

    if (muscle.role === MuscleRole.PRIMARY) {
      primaryCount += 1;
    }
  }

  if (primaryCount === 0) {
    throw new Error(
      `Exercise "${exercise.slug}" must have at least one primary muscle.`,
    );
  }

  validateProfile(exercise.slug, exercise.capabilities, 'capabilities');
  validateProfile(exercise.slug, exercise.demands, 'demands');
}

export function validateSeedData(): void {
  const muscles = [...parentMuscles, ...childMuscles];

  assertUniqueSlugs(muscleGroups, 'muscle group');
  assertUniqueSlugs(muscles, 'muscle');
  assertUniqueSlugs(muscleFunctions, 'muscle function');
  assertUniqueSlugs(equipment, 'equipment');
  assertUniqueSlugs(movementPatterns, 'movement pattern');
  assertUniqueSlugs(exercises, 'exercise');
  assertUniqueSlugs(exerciseCategories, 'exercise category');
  assertUniqueSlugs(
    globalRoutines.map((routine) => ({ slug: routine.key })),
    'global routine',
  );
  assertUniqueSlugs(
    globalTrainingPrograms.map((program) => ({ slug: program.key })),
    'global training program',
  );

  const muscleGroupSlugs = new Set(muscleGroups.map(({ slug }) => slug));
  const muscleSlugs = new Set(muscles.map(({ slug }) => slug));
  const muscleFunctionSlugs = new Set(muscleFunctions.map(({ slug }) => slug));
  const equipmentSlugs = new Set(equipment.map(({ slug }) => slug));
  const movementPatternSlugs = new Set(
    movementPatterns.map(({ slug }) => slug),
  );
  const exerciseSlugs = new Set(exercises.map(({ slug }) => slug));
  const parentSlugByChildSlug = new Map(
    childMuscles.map(({ slug, parentSlug }) => [slug, parentSlug]),
  );

  for (const muscle of muscles) {
    if (!muscleGroupSlugs.has(muscle.muscleGroupSlug)) {
      throw new Error(
        `Muscle "${muscle.slug}" references unknown muscle group slug "${muscle.muscleGroupSlug}".`,
      );
    }

    if (muscle.parentSlug && !muscleSlugs.has(muscle.parentSlug)) {
      throw new Error(
        `Muscle "${muscle.slug}" references unknown parent muscle slug "${muscle.parentSlug}".`,
      );
    }
  }

  const assignmentKeys = new Set<string>();

  for (const assignment of muscleFunctionAssignments) {
    if (!muscleSlugs.has(assignment.muscleSlug)) {
      throw new Error(
        `Muscle-function assignment references unknown muscle slug "${assignment.muscleSlug}".`,
      );
    }

    if (!muscleFunctionSlugs.has(assignment.muscleFunctionSlug)) {
      throw new Error(
        `Muscle-function assignment for "${assignment.muscleSlug}" references unknown function slug "${assignment.muscleFunctionSlug}".`,
      );
    }

    const assignmentKey = `${assignment.muscleSlug}:${assignment.muscleFunctionSlug}`;

    if (assignmentKeys.has(assignmentKey)) {
      throw new Error(
        `Duplicate muscle-function assignment "${assignmentKey}".`,
      );
    }

    assignmentKeys.add(assignmentKey);
  }

  for (const exercise of exercises) {
    validateExercise(
      exercise,
      muscleSlugs,
      equipmentSlugs,
      movementPatternSlugs,
    );

    const exerciseMuscleSlugs = new Set(
      exercise.muscles.map(({ muscleSlug }) => muscleSlug),
    );

    for (const muscleSlug of exerciseMuscleSlugs) {
      const parentSlug = parentSlugByChildSlug.get(muscleSlug);

      if (parentSlug && exerciseMuscleSlugs.has(parentSlug)) {
        throw new Error(
          `Exercise "${exercise.slug}" references both parent muscle "${parentSlug}" and child muscle "${muscleSlug}", which would double count the same anatomy.`,
        );
      }
    }
  }

  for (const routine of globalRoutines) {
    assertRequiredText(routine.name, `Global routine "${routine.key}" name`);
    assertRequiredText(
      routine.description,
      `Global routine "${routine.key}" description`,
    );

    routine.exercises.forEach((exercise, index) => {
      if (exercise.order !== index + 1) {
        throw new Error(
          `Global routine "${routine.key}" must use dense one-based seed order.`,
        );
      }
      if (!exerciseSlugs.has(exercise.exerciseSlug)) {
        throw new Error(
          `Global routine "${routine.key}" references unknown exercise slug "${exercise.exerciseSlug}".`,
        );
      }
      if (exercise.minReps > exercise.maxReps) {
        throw new Error(
          `Global routine "${routine.key}" has an invalid rep range for "${exercise.exerciseSlug}".`,
        );
      }
    });
  }

  const routineSlugs = new Set(globalRoutines.map(({ key }) => key));

  for (const program of globalTrainingPrograms) {
    assertRequiredText(
      program.name,
      `Global training program "${program.key}" name`,
    );
    assertRequiredText(
      program.description,
      `Global training program "${program.key}" description`,
    );

    if (!Number.isInteger(program.durationWeeks) || program.durationWeeks < 1) {
      throw new Error(
        `Global training program "${program.key}" must have a positive integer durationWeeks.`,
      );
    }

    const occupiedSlots = new Set<string>();
    for (const entry of program.schedule) {
      if (!routineSlugs.has(entry.routineKey)) {
        throw new Error(
          `Global training program "${program.key}" references unknown global routine "${entry.routineKey}".`,
        );
      }
      if (
        !Number.isInteger(entry.weekNumber) ||
        entry.weekNumber < 1 ||
        entry.weekNumber > program.durationWeeks
      ) {
        throw new Error(
          `Global training program "${program.key}" has an invalid weekNumber ${entry.weekNumber}.`,
        );
      }
      if (!Number.isInteger(entry.dayNumber) || entry.dayNumber < 1) {
        throw new Error(
          `Global training program "${program.key}" has an invalid dayNumber ${entry.dayNumber}.`,
        );
      }

      const slot = `${entry.weekNumber}:${entry.dayNumber}`;
      if (occupiedSlots.has(slot)) {
        throw new Error(
          `Global training program "${program.key}" contains duplicate schedule slot "${slot}".`,
        );
      }
      occupiedSlots.add(slot);
    }
  }
}
