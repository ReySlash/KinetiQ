import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { FindExercisesQueryDto } from './dto/find-exercises-query.dto';
import {
  buildExercisesFindAllQuery,
  mapExercisesFindAllRows,
} from './helpers/find-all-exercises-query';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(findExercisesQueryDto: FindExercisesQueryDto) {
    const { limit = 20, offset = 0, search } = findExercisesQueryDto;
    try {
      const exercises = await this.prisma.exercise.findMany(
        buildExercisesFindAllQuery({
          take: limit,
          skip: offset,
          search,
        }),
      );

      return mapExercisesFindAllRows(exercises);
    } catch {
      throw new InternalServerErrorException('Failed to fetch exercises');
    }
  }

  async findOne(slug: string) {
    try {
      const exercise = await this.prisma.exercise.findFirst({
        select: {
          name: true,
          slug: true,
          description: true,
          instructions: true,
          commonMistakes: true,
          forceType: true,
          kineticChain: true,
          isCompound: true,
          laterality: true,
          contractionMode: true,
          bodyPosition: true,
          skillLevel: true,
          thumbnailUrl: true,
          thumbnailStorageKey: true,
          imageAltText: true,

          movementPattern: {
            select: {
              name: true,
              slug: true,
              description: true,
            },
          },
          capabilities: {
            select: {
              hypertrophyPotential: true,
              maximalStrengthPotential: true,
              powerDevelopmentPotential: true,
              muscularEndurancePotential: true,
              stabilityDevelopmentPotential: true,
              typicalLoadability: true,
              stretchPositionLoading: true,
              shortenedPositionLoading: true,
              editorialNotes: true,
            },
          },
          demands: {
            select: {
              technicalDemand: true,
              setupComplexity: true,
              stabilityDemand: true,
              systemicFatiguePotential: true,
              localFatiguePotential: true,
              recoveryCostPotential: true,
              gripDemand: true,
              axialLoadingPotential: true,
              editorialNotes: true,
            },
          },
          muscles: {
            select: {
              muscle: {
                select: {
                  name: true,
                  slug: true,
                  thumbnailUrl: true,
                  imageAltText: true,
                },
              },
            },
          },
          equipment: {
            where: {
              equipment: {
                isActive: true,
              },
            },
            select: {
              equipment: {
                select: {
                  name: true,
                  slug: true,
                  description: true,
                },
              },
            },
          },
        },
        where: {
          slug,
          isActive: true,
        },
      });
      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }
      return {
        ...exercise,
        muscles: exercise.muscles.map(({ muscle }) => muscle),
        equipment: exercise.equipment.map(({ equipment }) => equipment),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exercise');
    }
  }
}
