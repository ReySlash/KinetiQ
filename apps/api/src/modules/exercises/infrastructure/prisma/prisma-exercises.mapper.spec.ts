import { Exercise } from '../../domain/entities/exercise.entity';
import type { CreateExerciseAttributes } from '../../domain/entities/exercise.types';
import {
  buildExercisesFindAllQuery,
  toCreateData,
  toDetail,
  toDomain,
  toListItem,
  toUpdateData,
  type ExerciseAggregateRow,
} from './prisma-exercises.mapper';

const movementPatternId = 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1';
const equipmentId = '223e4567-e89b-12d3-a456-426614174000';
const muscleId = '323e4567-e89b-12d3-a456-426614174000';

const exerciseInput: CreateExerciseAttributes = {
  name: 'Barbell Back Squat',
  description: 'A compound lower-body movement using a barbell.',
  instructions: 'Brace your trunk, descend under control, then stand tall.',
  movementPatternId,
  forceType: 'PUSH',
  kineticChain: 'CLOSED',
  isCompound: true,
  laterality: 'BILATERAL',
  contractionMode: 'DYNAMIC',
  bodyPosition: 'STANDING',
  skillLevel: 'BEGINNER',
  equipmentIds: [equipmentId],
  muscles: [{ muscleId, role: 'PRIMARY', involvementScore: 5 }],
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

function createExercise(): Exercise {
  return Exercise.create(exerciseInput);
}

describe('prisma exercises mapper', () => {
  it('builds the active, filtered, paginated list query', () => {
    const query = buildExercisesFindAllQuery({
      search: '  squat ',
      forceType: 'PUSH',
      laterality: 'BILATERAL',
      skillLevel: 'BEGINNER',
      limit: 10,
      offset: 20,
    });

    expect(query.take).toBe(10);
    expect(query.skip).toBe(20);
    expect(query.orderBy).toEqual({ name: 'asc' });
    expect(query.where).toEqual({
      isActive: true,
      forceType: 'PUSH',
      laterality: 'BILATERAL',
      skillLevel: 'BEGINNER',
      OR: [
        { name: { contains: 'squat', mode: 'insensitive' } },
        { slug: { contains: 'squat', mode: 'insensitive' } },
        {
          muscles: {
            some: {
              muscle: {
                OR: [
                  { name: { contains: 'squat', mode: 'insensitive' } },
                  { slug: { contains: 'squat', mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ],
    });
  });

  it('flattens nested list and detail relations', () => {
    const list = toListItem({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Squat',
      slug: 'squat',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      muscles: [{ muscle: { name: 'Quadriceps', slug: 'quadriceps' } }],
    });
    expect(list.muscles).toEqual([{ name: 'Quadriceps', slug: 'quadriceps' }]);

    const detail = toDetail({
      name: 'Squat',
      slug: 'squat',
      description: 'Description',
      instructions: 'Instructions',
      commonMistakes: null,
      forceType: 'PUSH',
      kineticChain: 'CLOSED',
      isCompound: true,
      laterality: 'BILATERAL',
      contractionMode: 'DYNAMIC',
      bodyPosition: 'STANDING',
      skillLevel: 'BEGINNER',
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: null,
      movementPattern: { name: 'Squat', slug: 'squat', description: null },
      capabilities: null,
      demands: null,
      muscles: [
        {
          muscle: {
            name: 'Quadriceps',
            slug: 'quadriceps',
            thumbnailUrl: null,
            imageAltText: null,
          },
        },
      ],
      equipment: [
        {
          equipment: { name: 'Barbell', slug: 'barbell', description: null },
        },
      ],
    });

    expect(detail.muscles).toHaveLength(1);
    expect(detail.equipment).toEqual([
      { name: 'Barbell', slug: 'barbell', description: null },
    ]);
  });

  it('reconstitutes a persisted aggregate', () => {
    const exercise = createExercise();
    const value = exercise.toValue();
    const row: ExerciseAggregateRow = {
      ...value,
      equipment: [{ equipmentId }],
      muscles: value.muscles,
      capabilities: value.capabilities,
      demands: value.demands,
    };

    const mapped = toDomain(row);

    expect(mapped.toValue()).toEqual(value);
  });

  it('maps scalar create data and excludes aggregate relations', () => {
    const exercise = createExercise();
    const data = toCreateData(exercise);

    expect(data).toMatchObject({
      id: exercise.id.value,
      name: exercise.name,
      slug: exercise.slug,
      movementPatternId: exercise.movementPatternId,
      isActive: true,
    });
    expect(data).not.toHaveProperty('equipmentIds');
    expect(data).not.toHaveProperty('muscles');
    expect(data).not.toHaveProperty('capabilities');
    expect(data).not.toHaveProperty('demands');
  });

  it('maps update data without changing the immutable slug', () => {
    const exercise = createExercise().update({ name: 'Front Squat' });
    const data = toUpdateData(exercise);

    expect(data).toMatchObject({ name: 'Front Squat' });
    expect(data).not.toHaveProperty('slug');
    expect(data).not.toHaveProperty('equipmentIds');
    expect(data).not.toHaveProperty('muscles');
  });
});
