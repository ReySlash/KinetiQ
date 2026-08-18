import { Exercise } from './exercise.entity';
import { ExerciseValidationError } from '../errors/exercise.errors';

const attributes = {
  name: 'Barbell Back Squat',
  description: 'A compound lower-body movement using a barbell.',
  instructions: 'Brace your trunk, descend under control, then stand tall.',
  movementPatternId: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
  forceType: 'PUSH' as const,
  kineticChain: 'CLOSED' as const,
  isCompound: true,
  laterality: 'BILATERAL' as const,
  contractionMode: 'DYNAMIC' as const,
  bodyPosition: 'STANDING' as const,
  skillLevel: 'BEGINNER' as const,
  equipmentIds: ['223e4567-e89b-12d3-a456-426614174000'],
  muscles: [
    {
      muscleId: '323e4567-e89b-12d3-a456-426614174000',
      role: 'PRIMARY' as const,
      involvementScore: 5,
      notes: 'Main target.',
    },
  ],
  capabilities: {
    hypertrophyPotential: 5,
    maximalStrengthPotential: 5,
    powerDevelopmentPotential: 3,
    muscularEndurancePotential: 2,
    stabilityDevelopmentPotential: 3,
    typicalLoadability: 5,
    stretchPositionLoading: 4,
    shortenedPositionLoading: 3,
  },
  demands: {
    technicalDemand: 3,
    setupComplexity: 2,
    stabilityDemand: 3,
    systemicFatiguePotential: 5,
    localFatiguePotential: 4,
    recoveryCostPotential: 5,
    gripDemand: 2,
    axialLoadingPotential: 5,
  },
};

describe('Exercise', () => {
  it('creates an exercise with a normalized generated identity', () => {
    const exercise = Exercise.create({
      ...attributes,
      name: '  Barbell Back Squat  ',
    });

    expect(exercise.id.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(exercise.name).toBe('Barbell Back Squat');
    expect(exercise.slug).toBe('barbell-back-squat');
    expect(exercise.muscles[0]?.notes).toBe('Main target.');
    expect(exercise.capabilities?.hypertrophyPotential).toBe(5);
  });

  it('preserves the slug while updating other fields', () => {
    const exercise = Exercise.create(attributes);
    const updated = exercise.update({ name: 'Front Squat' });

    expect(updated.name).toBe('Front Squat');
    expect(updated.slug).toBe(exercise.slug);
    expect(updated.id.value).toBe(exercise.id.value);
  });

  it('archives an exercise without changing its identity', () => {
    const exercise = Exercise.create(attributes);
    const archived = exercise.archive();

    expect(archived.isActive).toBe(false);
    expect(archived.archivedAt).toBeInstanceOf(Date);
    expect(archived.id.value).toBe(exercise.id.value);
  });

  it('reconstitutes persisted values without changing them', () => {
    const exercise = Exercise.create(attributes);
    expect(Exercise.reconstitute(exercise.toValue()).toValue()).toEqual(
      exercise.toValue(),
    );
  });

  it.each([
    [
      'duplicate equipment',
      {
        ...attributes,
        equipmentIds: [attributes.equipmentIds[0], attributes.equipmentIds[0]],
      },
    ],
    [
      'missing primary muscle',
      {
        ...attributes,
        muscles: [{ ...attributes.muscles[0], role: 'SECONDARY' as const }],
      },
    ],
    [
      'duplicate muscle',
      {
        ...attributes,
        muscles: [attributes.muscles[0], attributes.muscles[0]],
      },
    ],
    [
      'invalid score',
      {
        ...attributes,
        demands: { ...attributes.demands, gripDemand: 6 },
      },
    ],
  ])('rejects %s', (_, invalidAttributes) => {
    expect(() => Exercise.create(invalidAttributes)).toThrow(
      ExerciseValidationError,
    );
  });
});
