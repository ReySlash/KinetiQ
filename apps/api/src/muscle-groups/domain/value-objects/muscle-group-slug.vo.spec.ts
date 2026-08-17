import { MuscleGroupValidationError } from '../errors/muscle-group.errors';
import { MuscleGroupSlug } from './muscle-group-slug.vo';

describe('MuscleGroupSlug', () => {
  it('normalizes values to lowercase kebab-case', () => {
    expect(MuscleGroupSlug.create('  Upper / Body  ').value).toBe('upper-body');
  });

  it('rejects values without alphanumeric characters', () => {
    expect(() => MuscleGroupSlug.create('---')).toThrow(
      MuscleGroupValidationError,
    );
  });
});
