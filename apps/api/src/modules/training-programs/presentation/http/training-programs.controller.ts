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
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import {
  CurrentPrincipal,
  CurrentOptionalPrincipal,
  type AuthenticatedPrincipal,
} from '../../../shared/infrastructure/auth/principal';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from '../../application/use-cases/queries/get-training-program.use-case';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/commands/create-training-programs.use-case';
import { UpdateTrainingProgramUseCase } from '../../application/use-cases/commands/update-training-program.use-case';
import { DeleteTrainingProgramUseCase } from '../../application/use-cases/commands/delete-training-program.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { UpdateTrainingProgramDto } from './dto/update-training-program.dto';
import { toTrainingProgramsHttpException } from './training-programs-exception.mapper';
import { ListTrainingProgramsQueryDto } from './dto/list-training-programs-query.dto';

@Controller('training-programs')
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
