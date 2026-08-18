import { Exercise } from '../../../domain/entities/exercise.entity';
import { ExerciseNotFoundError } from '../../errors/exercise.errors';
import type { ExercisesCommandPort } from '../../ports/exercises-command.port';
import { ArchiveExerciseUseCase } from './archive-exercise.use-case';
import type { CreateExerciseInput } from '../../models/create-exercise.input';

const input: CreateExerciseInput = {
  name: 'Barbell Back Squat',
  description: 'A compound lower-body movement using a barbell.',
  instructions: 'Brace your trunk, descend under control, then stand tall.',
  movementPatternId: 'd8a4d7d2-05e5-4f36-85b3-8afc50f6b1a1',
  forceType: 'PUSH',
  kineticChain: 'CLOSED',
  isCompound: true,
  laterality: 'BILATERAL',
  contractionMode: 'DYNAMIC',
  bodyPosition: 'STANDING',
  skillLevel: 'BEGINNER',
  equipmentIds: ['223e4567-e89b-12d3-a456-426614174000'],
  muscles: [
    {
      muscleId: '323e4567-e89b-12d3-a456-426614174000',
      role: 'PRIMARY',
      involvementScore: 5,
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

describe('ArchiveExerciseUseCase', () => {
  it('archives and persists the aggregate', async () => {
    const existing = Exercise.create(input);
    const archive = jest.fn().mockResolvedValue(undefined);
    const port: ExercisesCommandPort = {
      findById: jest.fn().mockResolvedValue(existing),
      create: jest.fn(),
      update: jest.fn(),
      archive,
    };

    const result = await new ArchiveExerciseUseCase(port).execute(
      existing.id.value,
    );

    expect(result.id).toBe(existing.id.value);
    expect(result.archivedAt).toBeInstanceOf(Date);
    expect(archive).toHaveBeenCalledTimes(1);
  });

  it('throws not found when the command port cannot find the exercise', async () => {
    const port: ExercisesCommandPort = {
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    };

    await expect(
      new ArchiveExerciseUseCase(port).execute('missing-id'),
    ).rejects.toBeInstanceOf(ExerciseNotFoundError);
  });
});
