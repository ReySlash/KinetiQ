import { TrainingProgramDescription } from './training-program-description.vo';
import { TrainingProgramDuration } from './training-program-duration.vo';
import { UniqueId } from '../../../shared/domain/value-objects/unique-id.vo';
import { TrainingProgramName } from './training-program-name.vo';
import { TrainingProgramSlug } from './training-program-slug.vo';

describe('Training Program value objects', () => {
  it('normalizes names and descriptions', () => {
    expect(TrainingProgramName.create('  Strength Base  ').value).toBe(
      'Strength Base',
    );
    expect(TrainingProgramDescription.create('  Four weeks  ').value).toBe(
      'Four weeks',
    );
    expect(TrainingProgramDescription.create('   ').value).toBeNull();
  });

  it('rejects invalid names and durations', () => {
    expect(() => TrainingProgramName.create('A')).toThrow();
    expect(() => TrainingProgramDuration.create(0)).toThrow();
    expect(() => TrainingProgramDuration.create(1.5)).toThrow();
  });

  it('normalizes supplied slugs and generates omitted slugs', () => {
    const name = TrainingProgramName.create('Upper / Lower');
    const id = UniqueId.create();

    expect(
      TrainingProgramSlug.create('  Upper Program  ', name, id).value,
    ).toMatch(/^upper-program-[a-f0-9]{8}$/);
    expect(TrainingProgramSlug.create(undefined, name, id).value).toMatch(
      /^upper-lower-[a-f0-9]{8}$/,
    );
    expect(() => TrainingProgramSlug.create('!!!', name, id)).toThrow(
      'Training program slug must contain alphanumeric characters.',
    );
  });
});
