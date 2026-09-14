import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import {
  CurrentPrincipal,
  CurrentOptionalPrincipal,
  type AuthenticatedPrincipal,
} from '../../shared/infrastructure/auth/principal';
import { ListTrainingProgramsUseCase } from '../application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from '../application/use-cases/queries/get-training-program.use-case';
import { CreateTrainingProgramUseCase } from '../application/use-cases/commands/create-training-programs.use-case';
import { UpdateTrainingProgramUseCase } from '../application/use-cases/commands/update-training-program.use-case';
import { DeleteTrainingProgramUseCase } from '../application/use-cases/commands/delete-training-program.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { toTrainingProgramsHttpException } from './training-programs-exception.mapper';
import { ListTrainingProgramsQueryDto } from './dto/list-training-programs-query.dto';

@Controller('training-programs')
@ApiTags('training-programs')
@ApiCookieAuth('better-auth.session_token')
export class TrainingProgramsController {
  constructor(
    private readonly listTrainingPrograms: ListTrainingProgramsUseCase,
    private readonly getTrainingProgram: GetTrainingProgramUseCase,
    private readonly createTrainingProgram: CreateTrainingProgramUseCase,
    private readonly updateTrainingProgram: UpdateTrainingProgramUseCase,
    private readonly deleteTrainingProgram: DeleteTrainingProgramUseCase,
  ) {}

  @Get()
  @OptionalAuth()
  @ApiOperation({ summary: 'List owned or global training programs' })
  @ApiQuery({ name: 'scope', required: false, enum: ['my', 'global'] })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Name or description search',
  })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200 })
  async findAll(
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
    @Query() query: ListTrainingProgramsQueryDto,
  ) {
    try {
      return await this.listTrainingPrograms.execute({ principal, ...query });
    } catch (error) {
      throw toTrainingProgramsHttpException(error);
    }
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an owned training program' })
  @ApiParam({ name: 'slug', example: 'strength-base-12345678' })
  @ApiBody({ type: UpdateTrainingProgramDto })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Training program not found' })
  async update(
    @Param('slug') slug: string,
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() updateTrainingProgramDto: UpdateTrainingProgramDto,
  ) {
    if (
      updateTrainingProgramDto.name === undefined &&
      updateTrainingProgramDto.description === undefined &&
      updateTrainingProgramDto.durationWeeks === undefined &&
      updateTrainingProgramDto.schedule === undefined
    ) {
      throw new BadRequestException(
        'At least one training program field must be provided.',
      );
    }
    try {
      const result = await this.updateTrainingProgram.execute({
        ownerId: principal.userId,
        slug,
        name: updateTrainingProgramDto.name,
        description: updateTrainingProgramDto.description,
        durationWeeks: updateTrainingProgramDto.durationWeeks,
        schedule: updateTrainingProgramDto.schedule,
      });
      return {
        message: 'Training program updated successfully',
        slug: result.slug,
      };
    } catch (error) {
      throw toTrainingProgramsHttpException(error);
    }
  }

  @Get(':slug')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get an owned or global training program' })
  @ApiParam({ name: 'slug', example: 'strength-base-12345678' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Training program not found' })
  async findOne(
    @Param('slug') slug: string,
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
  ) {
    try {
      return await this.getTrainingProgram.execute({
        slug,
        ...(principal ? { ownerId: principal.userId } : {}),
      });
    } catch (error) {
      throw toTrainingProgramsHttpException(error);
    }
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an owned training program' })
  @ApiParam({ name: 'slug', example: 'strength-base-12345678' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Training program not found' })
  async delete(
    @Param('slug') slug: string,
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
  ) {
    try {
      const result = await this.deleteTrainingProgram.execute({
        slug,
        ownerId: principal.userId,
      });
      return {
        message: 'Training program deleted successfully',
        slug: result.slug,
      };
    } catch (error) {
      throw toTrainingProgramsHttpException(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create an owned training program' })
  @ApiBody({ type: CreateTrainingProgramDto })
  @ApiResponse({ status: 201 })
  async create(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() createTrainingProgramDto: CreateTrainingProgramDto,
  ) {
    try {
      const result = await this.createTrainingProgram.execute({
        ownerId: principal.userId,
        name: createTrainingProgramDto.name,
        slug: createTrainingProgramDto.slug,
        description: createTrainingProgramDto.description ?? null,
        durationWeeks: createTrainingProgramDto.durationWeeks,
        schedule: createTrainingProgramDto.schedule,
      });
      return {
        message: 'Training program created successfully',
        slug: result.slug,
      };
    } catch (error) {
      throw toTrainingProgramsHttpException(error);
    }
  }
}
