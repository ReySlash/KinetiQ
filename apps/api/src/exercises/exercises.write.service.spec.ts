jest.mock(
  '../modules/shared/infrastructure/database/prisma/prisma.service',
  () => ({
    PrismaService: class PrismaService {},
  }),
);

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleRole,
  SkillLevel,
} from '../../generated/prisma/client';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';
import {
  CreateExerciseDto,
  ExerciseCapabilityProfileDto,
  ExerciseDemandProfileDto,
  ExerciseMuscleAssignmentDto,
} from './dto/create-exercise.dto';
import { ExercisesService } from './exercises.service';

const exerciseId = '123e4567-e89b-12d3-a456-426614174000';
const movementPatternId = '223e4567-e89b-12d3-a456-426614174000';
const equipmentId = '323e4567-e89b-12d3-a456-426614174000';
const muscleId = '423e4567-e89b-12d3-a456-426614174000';

function buildCreateDto(): CreateExerciseDto {
  const muscle: ExerciseMuscleAssignmentDto = {
    muscleId,
    role: MuscleRole.PRIMARY,
    involvementScore: 5,
  };
  const capabilities: ExerciseCapabilityProfileDto = {
    hypertrophyPotential: 4,
    maximalStrengthPotential: 5,
    powerDevelopmentPotential: 2,
    muscularEndurancePotential: 2,
    stabilityDevelopmentPotential: 3,
    typicalLoadability: 5,
    stretchPositionLoading: 3,
    shortenedPositionLoading: 4,
  };
  const demands: ExerciseDemandProfileDto = {
    technicalDemand: 3,
    setupComplexity: 2,
    stabilityDemand: 3,
    systemicFatiguePotential: 4,
    localFatiguePotential: 4,
    recoveryCostPotential: 4,
    gripDemand: 2,
    axialLoadingPotential: 4,
  };

  return {
    name: 'Bench Press',
    slug: 'bench press',
    description: 'A horizontal pressing exercise for the upper body.',
    instructions: 'Set up on the bench and press the bar away from the chest.',
    movementPatternId,
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.OPEN,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.SUPINE,
    skillLevel: SkillLevel.INTERMEDIATE,
    equipmentIds: [equipmentId],
    muscles: [muscle],
    capabilities,
    demands,
  };
}

describe('ExercisesService write operations', () => {
  let service: ExercisesService;
  let create: jest.Mock<Promise<unknown>, [unknown]>;
  let createManyEquipment: jest.Mock<Promise<unknown>, [unknown]>;
  let createManyMuscles: jest.Mock<Promise<unknown>, [unknown]>;
  let capabilityUpsert: jest.Mock<Promise<unknown>, [unknown]>;
  let demandUpsert: jest.Mock<Promise<unknown>, [unknown]>;

  beforeEach(async () => {
    create = jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({
      id: exerciseId,
      slug: 'bench-press',
    });
    createManyEquipment = jest
      .fn<Promise<unknown>, [unknown]>()
      .mockResolvedValue({ count: 1 });
    createManyMuscles = jest
      .fn<Promise<unknown>, [unknown]>()
      .mockResolvedValue({ count: 1 });
    capabilityUpsert = jest
      .fn<Promise<unknown>, [unknown]>()
      .mockResolvedValue({});
    demandUpsert = jest.fn<Promise<unknown>, [unknown]>().mockResolvedValue({});

    const transaction = {
      exercise: { create },
      exerciseEquipment: {
        deleteMany: jest.fn(),
        createMany: createManyEquipment,
      },
      exerciseMuscle: {
        deleteMany: jest.fn(),
        createMany: createManyMuscles,
      },
      exerciseCapabilityProfile: { upsert: capabilityUpsert },
      exerciseDemandProfile: { upsert: demandUpsert },
    };
    const prismaServiceMock = {
      $transaction: jest.fn(
        async (callback: (client: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  it('creates the complete exercise aggregate in one transaction', async () => {
    await expect(service.create(buildCreateDto())).resolves.toEqual({
      id: exerciseId,
      slug: 'bench-press',
      message: 'Exercise created successfully',
    });

    expect(create.mock.calls[0]?.[0]).toMatchObject({
      data: {
        slug: 'bench-press',
        isActive: true,
        archivedAt: null,
      },
    });
    expect(createManyEquipment).toHaveBeenCalledWith({
      data: [{ exerciseId, equipmentId }],
    });
    expect(createManyMuscles).toHaveBeenCalledWith({
      data: [
        {
          exerciseId,
          muscleId,
          role: MuscleRole.PRIMARY,
          involvementScore: 5,
          notes: null,
        },
      ],
    });
    expect(capabilityUpsert).toHaveBeenCalledTimes(1);
    expect(demandUpsert).toHaveBeenCalledTimes(1);
  });

  it('rejects an aggregate without a primary muscle', async () => {
    const dto = buildCreateDto();
    dto.muscles[0].role = MuscleRole.SECONDARY;

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });
});
