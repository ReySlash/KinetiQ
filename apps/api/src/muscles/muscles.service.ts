import { Injectable } from '@nestjs/common';
import { toPrismaUniqueConstraintBadRequest } from '../common/prisma/prisma-unique-constraint';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { buildMuscleCreateData } from './mappers/create-muscle.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MusclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMuscleDto: CreateMuscleDto) {
    const newMuscle = buildMuscleCreateData(createMuscleDto);

    try {
      await this.prisma.muscle.create({
        data: newMuscle,
      });

      return {
        message: 'Muscle created successfully',
      };
    } catch (error) {
      const uniqueConstraintError = toPrismaUniqueConstraintBadRequest(error, {
        entityLabel: 'muscle',
        fieldMessages: {
          name: 'A muscle with that name already exists',
          slug: 'A muscle with that slug already exists',
        },
        resolveField: (detectedField) =>
          createMuscleDto.slug ? (detectedField ?? 'slug') : 'name',
      });

      if (uniqueConstraintError) {
        throw uniqueConstraintError;
      }

      throw error;
    }
  }

  findAll() {
    return `This action returns all muscles`;
  }

  findOne(id: string) {
    return `This action returns a #${id} muscle`;
  }
}
