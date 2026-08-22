import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@thallesp/nestjs-better-auth';
import { Throttle } from '@nestjs/throttler';
import { CreateMuscleUseCase } from '../application/use-cases/commands/create-muscle.use-case';
import { DeactivateMuscleUseCase } from '../application/use-cases/commands/deactivate-muscle.use-case';
import { UpdateMuscleUseCase } from '../application/use-cases/commands/update-muscle.use-case';
import { CreateMuscleDto } from './dto/create-muscle.dto';
import { UpdateMuscleDto } from './dto/update-muscle.dto';
import { toMusclesHttpException } from './muscles-exception.mapper';

@Controller('admin/muscles')
@ApiTags('admin/muscles')
@ApiCookieAuth('better-auth.session_token')
@Roles(['ADMIN'])
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AdminMusclesController {
  constructor(
    private readonly createMuscle: CreateMuscleUseCase,
    private readonly updateMuscle: UpdateMuscleUseCase,
    private readonly deactivateMuscle: DeactivateMuscleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a muscle' })
  @ApiBody({ type: CreateMuscleDto })
  @ApiResponse({ status: 201 })
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
  @ApiOperation({ summary: 'Update a muscle' })
  @ApiParam({ name: 'slug', example: 'biceps-brachii' })
  @ApiBody({ type: UpdateMuscleDto })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Muscle not found' })
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
  @ApiOperation({ summary: 'Deactivate a muscle' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Muscle not found' })
  async remove(@Param('id') id: string) {
    try {
      await this.deactivateMuscle.execute(id);
      return 'Resource soft-deleted successfully';
    } catch (error) {
      throw toMusclesHttpException(error);
    }
  }
}
