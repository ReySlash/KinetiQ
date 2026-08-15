import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../modules/shared/infrastructure/database/prisma/prisma.service';
import { buildMuscleGroupsFindAllQuery } from './helpers/find-all-muscle-groups-query';
import { buildMuscleGroupsFindOneQuery } from './helpers/find-one-muscle-group-query';

@Injectable()
export class MuscleGroupsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() {
    try {
      const muscleGroups = await this.prisma.muscleGroup.findMany(
        buildMuscleGroupsFindAllQuery(),
      );
      return muscleGroups;
    } catch {
      throw new InternalServerErrorException('Failed to fetch muscle groups');
    }
  }

  async findOne(slug: string) {
    try {
      const muscleGroup = await this.prisma.muscleGroup.findUnique(
        buildMuscleGroupsFindOneQuery(slug),
      );

      if (!muscleGroup) {
        throw new NotFoundException('Muscle group not found.');
      }
      return muscleGroup;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Muscle group not found.');
      }
      throw new InternalServerErrorException('Failed to fetch muscle group');
    }
  }
}
