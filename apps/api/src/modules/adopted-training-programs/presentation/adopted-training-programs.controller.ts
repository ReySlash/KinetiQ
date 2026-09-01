import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { CurrentPrincipal } from '../../shared/infrastructure/auth/principal';
import type {
  AdoptTrainingProgramInput,
  AdoptedTrainingProgramLifecycleInput,
  SkipProgramWorkoutOccurrenceInput,
  StartProgramWorkoutOccurrenceInput,
} from '../application/models/adopted-training-program-command.input';
import { AdoptTrainingProgramUseCase } from '../application/use-cases/adopt-training-program.use-case';
import { CancelAdoptedTrainingProgramUseCase } from '../application/use-cases/cancel-adopted-training-program.use-case';
import { GetAdoptedTrainingProgramUseCase } from '../application/use-cases/get-adopted-training-program.use-case';
import { GetNonTerminalAdoptedTrainingProgramUseCase } from '../application/use-cases/get-non-terminal-adopted-training-program.use-case';
import { PauseAdoptedTrainingProgramUseCase } from '../application/use-cases/pause-adopted-training-program.use-case';
import { ResumeAdoptedTrainingProgramUseCase } from '../application/use-cases/resume-adopted-training-program.use-case';
import { SkipProgramWorkoutOccurrenceUseCase } from '../application/use-cases/skip-program-workout-occurrence.use-case';
import { StartProgramWorkoutOccurrenceUseCase } from '../application/use-cases/start-program-workout-occurrence.use-case';
import { AdoptTrainingProgramDto } from './dto/adopt-training-program.dto';
import {
  AdoptedTrainingProgramDetailResponseDto,
  AdoptedTrainingProgramMutationResponseDto,
  AdoptTrainingProgramResponseDto,
  StartProgramWorkoutOccurrenceResponseDto,
} from './dto/adopted-training-program-response.dto';
import { StartProgramWorkoutOccurrenceDto } from './dto/start-program-workout-occurrence.dto';
import { toAdoptedTrainingProgramsHttpException } from './adopted-training-programs-exception.mapper';

@Controller('user-training-programs')
@ApiTags('user-training-programs')
@ApiCookieAuth('better-auth.session_token')
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AdoptedTrainingProgramsController {
  constructor(
    private readonly adoptTrainingProgram: AdoptTrainingProgramUseCase,
    private readonly getNonTerminalTrainingProgram: GetNonTerminalAdoptedTrainingProgramUseCase,
    private readonly getTrainingProgram: GetAdoptedTrainingProgramUseCase,
    private readonly pauseTrainingProgram: PauseAdoptedTrainingProgramUseCase,
    private readonly resumeTrainingProgram: ResumeAdoptedTrainingProgramUseCase,
    private readonly cancelTrainingProgram: CancelAdoptedTrainingProgramUseCase,
    private readonly startOccurrence: StartProgramWorkoutOccurrenceUseCase,
    private readonly skipOccurrence: SkipProgramWorkoutOccurrenceUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Adopt an accessible training program' })
  @ApiBody({ type: AdoptTrainingProgramDto })
  @ApiResponse({ status: 201, type: AdoptTrainingProgramResponseDto })
  async adopt(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() dto: AdoptTrainingProgramDto,
  ) {
    try {
      const input: AdoptTrainingProgramInput = {
        ownerId: principal.userId,
        sourceProgramSlug: dto.sourceProgramSlug,
      };
      return await this.adoptTrainingProgram.execute(input);
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the current adopted training program' })
  @ApiResponse({
    status: 200,
    description: 'The active or paused program, or null when none exists.',
    nullable: true,
    type: AdoptedTrainingProgramDetailResponseDto,
  })
  async getActive(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    try {
      return await this.getNonTerminalTrainingProgram.execute(principal.userId);
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }

  @Get(':adoptedTrainingProgramId')
  @ApiOperation({ summary: 'Get one adopted training program' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdoptedTrainingProgramDetailResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Adopted training program not found',
  })
  async getOne(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
  ) {
    try {
      return await this.getTrainingProgram.execute(
        adoptedTrainingProgramId,
        principal.userId,
      );
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }

  @Post(':adoptedTrainingProgramId/pause')
  @ApiOperation({ summary: 'Pause an adopted training program' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdoptedTrainingProgramMutationResponseDto })
  async pause(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
  ) {
    return this.executeLifecycle(
      this.pauseTrainingProgram,
      principal,
      adoptedTrainingProgramId,
    );
  }

  @Post(':adoptedTrainingProgramId/resume')
  @ApiOperation({ summary: 'Resume an adopted training program' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdoptedTrainingProgramMutationResponseDto })
  async resume(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
  ) {
    return this.executeLifecycle(
      this.resumeTrainingProgram,
      principal,
      adoptedTrainingProgramId,
    );
  }

  @Post(':adoptedTrainingProgramId/cancel')
  @ApiOperation({ summary: 'Cancel an adopted training program' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdoptedTrainingProgramMutationResponseDto })
  async cancel(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
  ) {
    return this.executeLifecycle(
      this.cancelTrainingProgram,
      principal,
      adoptedTrainingProgramId,
    );
  }

  @Post(':adoptedTrainingProgramId/workouts/:occurrenceId/start')
  @ApiOperation({ summary: 'Start the next adopted-program workout' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiParam({ name: 'occurrenceId', format: 'uuid' })
  @ApiBody({ type: StartProgramWorkoutOccurrenceDto })
  @ApiResponse({ status: 201, type: StartProgramWorkoutOccurrenceResponseDto })
  async start(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
    @Param('occurrenceId', new ParseUUIDPipe()) occurrenceId: string,
    @Body() dto: StartProgramWorkoutOccurrenceDto,
  ) {
    try {
      const input: StartProgramWorkoutOccurrenceInput = {
        ...dto,
        ownerId: principal.userId,
        adoptedTrainingProgramId,
        occurrenceId,
      };
      return await this.startOccurrence.execute(input);
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }

  @Post(':adoptedTrainingProgramId/workouts/:occurrenceId/skip')
  @ApiOperation({ summary: 'Skip the next adopted-program workout' })
  @ApiParam({ name: 'adoptedTrainingProgramId', format: 'uuid' })
  @ApiParam({ name: 'occurrenceId', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdoptedTrainingProgramMutationResponseDto })
  async skip(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('adoptedTrainingProgramId', new ParseUUIDPipe())
    adoptedTrainingProgramId: string,
    @Param('occurrenceId', new ParseUUIDPipe()) occurrenceId: string,
  ) {
    try {
      const input: SkipProgramWorkoutOccurrenceInput = {
        ownerId: principal.userId,
        adoptedTrainingProgramId,
        occurrenceId,
      };
      return await this.skipOccurrence.execute(input);
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }

  private async executeLifecycle(
    useCase: {
      execute: (
        input: AdoptedTrainingProgramLifecycleInput,
      ) => Promise<unknown>;
    },
    principal: AuthenticatedPrincipal,
    adoptedTrainingProgramId: string,
  ) {
    try {
      return await useCase.execute({
        ownerId: principal.userId,
        adoptedTrainingProgramId,
      });
    } catch (error) {
      throw toAdoptedTrainingProgramsHttpException(error);
    }
  }
}
