import {
  ExerciseBodyPosition,
  ExerciseContractionMode,
  ExerciseForceType,
  ExerciseKineticChain,
  ExerciseLaterality,
  ExerciseMuscleRole,
  ExerciseSkillLevel,
} from './exercise-enums.vo';
import {
  ExerciseImageAltText,
  ExerciseThumbnailStorageKey,
  ExerciseThumbnailUrl,
} from './exercise-media.vo';
import { ExerciseScore } from './exercise-score.vo';
import { ExerciseSlug } from './exercise-slug.vo';
import {
  ExerciseCommonMistakes,
  ExerciseDescription,
  ExerciseEditorialNotes,
  ExerciseInstructions,
  ExerciseName,
  ExerciseNotes,
} from './exercise-text.vo';
import { ExerciseValidationError } from '../errors/exercise.errors';

describe('Exercise value objects', () => {
  it('trims validated text fields', () => {
    expect(ExerciseName.create('  Squat  ').value).toBe('Squat');
    expect(
      ExerciseDescription.create(`  ${'A'.repeat(20)}  `).value,
    ).toHaveLength(20);
    expect(
      ExerciseInstructions.create(`  ${'A'.repeat(20)}  `).value,
    ).toHaveLength(20);
    expect(ExerciseCommonMistakes.create('  mistake  ').value).toBe('mistake');
    expect(ExerciseNotes.create('  note  ').value).toBe('note');
    expect(ExerciseEditorialNotes.create('  editorial note  ').value).toBe(
      'editorial note',
    );
  });

  it('normalizes slugs', () => {
    expect(ExerciseSlug.create(' Barbell / Squat ').value).toBe(
      'barbell-squat',
    );
  });

  it('validates media length limits', () => {
    expect(() => ExerciseThumbnailUrl.create('x'.repeat(2049))).toThrow(
      ExerciseValidationError,
    );
    expect(() => ExerciseThumbnailStorageKey.create('x'.repeat(513))).toThrow(
      ExerciseValidationError,
    );
    expect(() => ExerciseImageAltText.create('x'.repeat(201))).toThrow(
      ExerciseValidationError,
    );
  });

  it('validates scores from zero through five', () => {
    expect(ExerciseScore.create(0).value).toBe(0);
    expect(ExerciseScore.create(5).value).toBe(5);
    expect(() => ExerciseScore.create(-1)).toThrow(ExerciseValidationError);
    expect(() => ExerciseScore.create(6)).toThrow(ExerciseValidationError);
  });

  it('accepts the supported enum values', () => {
    expect(ExerciseForceType.create('PUSH').value).toBe('PUSH');
    expect(ExerciseKineticChain.create('OPEN').value).toBe('OPEN');
    expect(ExerciseLaterality.create('BILATERAL').value).toBe('BILATERAL');
    expect(ExerciseContractionMode.create('DYNAMIC').value).toBe('DYNAMIC');
    expect(ExerciseBodyPosition.create('STANDING').value).toBe('STANDING');
    expect(ExerciseSkillLevel.create('BEGINNER').value).toBe('BEGINNER');
    expect(ExerciseMuscleRole.create('PRIMARY').value).toBe('PRIMARY');
  });

  it('rejects invalid enum values', () => {
    expect(() => ExerciseForceType.create('INVALID' as never)).toThrow(
      ExerciseValidationError,
    );
    expect(() => ExerciseMuscleRole.create('INVALID' as never)).toThrow(
      ExerciseValidationError,
    );
  });
});
