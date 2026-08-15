import { MuscleValidationError } from '../errors/muscle.errors';
import { MuscleSlug } from './muscle-slug.vo';

describe('MuscleSlug', () => {
  it('normalizes the same slug format used by the current mapper', () => {
    expect(MuscleSlug.create('  Biceps / Brachii  ').value).toBe(
      'biceps-brachii',
    );
  });

  it('rejects a slug without alphanumeric characters', () => {
    expect(() => MuscleSlug.create('---')).toThrow(MuscleValidationError);
  });
});
