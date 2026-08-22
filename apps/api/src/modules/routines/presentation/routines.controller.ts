import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import { Throttle } from '@nestjs/throttler';
import { CreateRoutineUseCase } from '../application/use-cases/commands/create-routine.use-case';
import { DeleteRoutineUseCase } from '../application/use-cases/commands/delete-routine.use-case';
import { DuplicateRoutineUseCase } from '../application/use-cases/commands/duplicate-routine.use-case';
import { UpdateRoutineUseCase } from '../application/use-cases/commands/update-routine.use-case';
import { GetRoutineUseCase } from '../application/use-cases/queries/get-routine.use-case';
import { ListRoutinesUseCase } from '../application/use-cases/queries/list-routines.use-case';
import {
  CurrentOptionalPrincipal,
  CurrentPrincipal,
  type AuthenticatedPrincipal,
} from '../../shared/infrastructure/auth/principal';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import {
  RoutineDetailDto,
  RoutineListItemDto,
  RoutineMutationResponseDto,
} from './dto/routine-response.dto';
import { toRoutinesHttpException } from './routines-exception.mapper';

@Controller('routines')
@ApiTags('routines')
@ApiCookieAuth('better-auth.session_token')
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class RoutinesController {
  constructor(
    private readonly listRoutines: ListRoutinesUseCase,
    private readonly getRoutine: GetRoutineUseCase,
    private readonly createRoutine: CreateRoutineUseCase,
    private readonly updateRoutine: UpdateRoutineUseCase,
    private readonly deleteRoutine: DeleteRoutineUseCase,
    private readonly duplicateRoutine: DuplicateRoutineUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an owned routine' })
  @ApiResponse({ status: 201, type: RoutineMutationResponseDto })
  async create(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() dto: CreateRoutineDto,
  ) {
    try {
      const result = await this.createRoutine.execute({
        ...dto,
        ownerId: principal.userId,
      });
      return { message: 'Routine created successfully', slug: result.slug };
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'List owned or global routines' })
  @ApiQuery({ name: 'scope', required: false, enum: ['my', 'global'] })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Name or description search',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['updatedAt:asc', 'updatedAt:desc', 'name:asc', 'name:desc'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, type: [RoutineListItemDto] })
  async findAll(
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
    @Query() query: FindRoutinesQueryDto,
  ) {
    try {
      return await this.listRoutines.execute({
        ...query,
        ...(principal ? { ownerId: principal.userId } : {}),
      });
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }

  @Get(':slug')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get an owned or global routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineDetailDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async findOne(
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
    @Param('slug') slug: string,
  ) {
    try {
      return await this.getRoutine.execute({
        slug,
        ...(principal ? { ownerId: principal.userId } : {}),
      });
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an owned routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async update(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    try {
      const result = await this.updateRoutine.execute({
        ...dto,
        ownerId: principal.userId,
        slug,
      });
      return { message: 'Routine updated successfully', slug: result.slug };
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an owned routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async remove(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
  ) {
    try {
      const result = await this.deleteRoutine.execute({
        ownerId: principal.userId,
        slug,
      });
      return { message: 'Routine deleted successfully', slug: result.slug };
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }

  @Post(':slug/duplicate')
  @ApiOperation({ summary: 'Duplicate an owned or global routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 201, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async duplicate(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
  ) {
    try {
      const result = await this.duplicateRoutine.execute({
        ownerId: principal.userId,
        slug,
      });
      return { message: 'Routine duplicated successfully', slug: result.slug };
    } catch (error) {
      throw toRoutinesHttpException(error);
    }
  }
}
