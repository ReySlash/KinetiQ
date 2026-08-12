import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OptionalAuth } from '@thallesp/nestjs-better-auth';
import {
  CurrentPrincipal,
  CurrentOptionalPrincipal,
  type AuthenticatedPrincipal,
} from '../../../../auth/principal';
import { ListTrainingProgramsUseCase } from '../../application/use-cases/queries/list-training-programs.use-case';
import { GetTrainingProgramUseCase } from '../../application/use-cases/queries/get-training-program.use-case';
import { CreateTrainingProgramUseCase } from '../../application/use-cases/commands/create-training-programs.use-case';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { toTrainingProgramsHttpException } from './training-programs-exception.mapper';
import { ListTrainingProgramsQueryDto } from './dto/list-training-programs-query.dto';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(
    private readonly listTrainingPrograms: ListTrainingProgramsUseCase,
    private readonly getTrainingProgram: GetTrainingProgramUseCase,
    private readonly createTrainingProgram: CreateTrainingProgramUseCase,
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
