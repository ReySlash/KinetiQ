import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '@thallesp/nestjs-better-auth';
import { CreateMuscleUseCase } from '../application/use-cases/commands/create-muscle.use-case';
import { DeactivateMuscleUseCase } from '../application/use-cases/commands/deactivate-muscle.use-case';
import { UpdateMuscleUseCase } from '../application/use-cases/commands/update-muscle.use-case';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { toMusclesHttpException } from './muscles-exception.mapper';

@Controller('admin/muscles')
@Roles(['ADMIN'])
export class AdminMusclesController {
  constructor(
    private readonly createMuscle: CreateMuscleUseCase,
    private readonly updateMuscle: UpdateMuscleUseCase,
    private readonly deactivateMuscle: DeactivateMuscleUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateMuscleDto) {
    try {
      await this.createMuscle.execute({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        bodyRegion: dto.bodyRegion,
        muscleGroupId: dto.muscleGroupId,
        parentId: dto.parentId,
        thumbnailUrl: dto.thumbnailUrl,
        thumbnailStorageKey: dto.thumbnailStorageKey,
        imageAltText: dto.imageAltText,
        sortOrder: dto.sortOrder,
      });
      return { message: 'Muscle created successfully' };
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }

  @Patch(':slug')
  async update(@Param('slug') slug: string, @Body() dto: UpdateMuscleDto) {
    try {
      await this.updateMuscle.execute(slug, {
        name: dto.name,
        description: dto.description,
        bodyRegion: dto.bodyRegion,
        muscleGroupId: dto.muscleGroupId,
        parentId: dto.parentId,
        thumbnailUrl: dto.thumbnailUrl,
        thumbnailStorageKey: dto.thumbnailStorageKey,
        imageAltText: dto.imageAltText,
        sortOrder: dto.sortOrder,
      });
      return 'Muscle updated successfully';
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.deactivateMuscle.execute(id);
      return 'Resource soft-deleted successfully';
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }
}
