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
import {
  buildExercisesFindOneQuery,
  mapExerciseFindOneRow,
} from './helpers/find-one-exercises-query';

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
      const exercise = await this.prisma.exercise.findFirst(
        buildExercisesFindOneQuery(slug),
      );
      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }
      return mapExerciseFindOneRow(exercise);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exercise');
    }
  }
}
