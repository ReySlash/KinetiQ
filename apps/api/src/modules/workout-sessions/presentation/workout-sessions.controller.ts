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
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { CurrentPrincipal } from '../../shared/infrastructure/auth/principal';
import { AddWorkoutExerciseUseCase } from '../application/use-cases/commands/add-workout-exercise.use-case';
import { CancelWorkoutUseCase } from '../application/use-cases/commands/cancel-workout.use-case';
import { CompleteWorkoutUseCase } from '../application/use-cases/commands/complete-workout.use-case';
import { DeleteWorkoutSetUseCase } from '../application/use-cases/commands/delete-workout-set.use-case';
import { RecordWorkoutSetUseCase } from '../application/use-cases/commands/record-workout-set.use-case';
import { RemoveWorkoutExerciseUseCase } from '../application/use-cases/commands/remove-workout-exercise.use-case';
import { StartWorkoutUseCase } from '../application/use-cases/commands/start-workout.use-case';
import { UpdateWorkoutSetUseCase } from '../application/use-cases/commands/update-workout-set.use-case';
import { GetActiveWorkoutUseCase } from '../application/use-cases/queries/get-active-workout.use-case';
import { GetExerciseHistoryUseCase } from '../application/use-cases/queries/get-exercise-history.use-case';
import { GetWorkoutUseCase } from '../application/use-cases/queries/get-workout.use-case';
import { ListWorkoutHistoryUseCase } from '../application/use-cases/queries/list-workout-history.use-case';
import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { CancelWorkoutDto } from './dto/cancel-workout.dto';
import { CompleteWorkoutDto } from './dto/complete-workout.dto';
import { DeleteWorkoutSetDto } from './dto/delete-workout-set.dto';
import { GetExerciseHistoryQueryDto } from './dto/get-exercise-history-query.dto';
import { ListWorkoutHistoryQueryDto } from './dto/list-workout-history-query.dto';
import { RecordWorkoutSetDto } from './dto/record-workout-set.dto';
import { RemoveWorkoutExerciseDto } from './dto/remove-workout-exercise.dto';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import {
  ExerciseHistoryResponseDto,
  WorkoutSessionDetailResponseDto,
  WorkoutSessionListItemResponseDto,
  WorkoutSessionMutationResponseDto,
} from './dto/workout-session-response.dto';
import { toWorkoutSessionsHttpException } from './workout-sessions-exception.mapper';

@Controller('workout-sessions')
@ApiTags('workout-sessions')
@ApiExtraModels(WorkoutSessionDetailResponseDto)
@ApiCookieAuth('better-auth.session_token')
@Throttle({ default: { limit: 60, ttl: 60_000 } })
export class WorkoutSessionsController {
  constructor(
    private readonly startWorkout: StartWorkoutUseCase,
    private readonly addWorkoutExercise: AddWorkoutExerciseUseCase,
    private readonly removeWorkoutExercise: RemoveWorkoutExerciseUseCase,
    private readonly recordWorkoutSet: RecordWorkoutSetUseCase,
    private readonly updateWorkoutSet: UpdateWorkoutSetUseCase,
    private readonly deleteWorkoutSet: DeleteWorkoutSetUseCase,
    private readonly completeWorkout: CompleteWorkoutUseCase,
    private readonly cancelWorkout: CancelWorkoutUseCase,
    private readonly getActiveWorkout: GetActiveWorkoutUseCase,
    private readonly getWorkout: GetWorkoutUseCase,
    private readonly listWorkoutHistory: ListWorkoutHistoryUseCase,
    private readonly getExerciseHistoryUseCase: GetExerciseHistoryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start a workout session' })
  @ApiBody({ type: StartWorkoutDto })
  @ApiResponse({ status: 201, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 409, description: 'An active workout already exists' })
  @ApiResponse({
    status: 422,
    description: 'The requested routine is unavailable',
  })
  async start(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() dto: StartWorkoutDto,
  ) {
    try {
      return await this.startWorkout.execute({
        ...dto,
        ownerId: principal.userId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the current active workout' })
  @ApiResponse({
    status: 200,
    description: 'The active workout, or null when no workout is active.',
    schema: {
      nullable: true,
      allOf: [{ $ref: getSchemaPath(WorkoutSessionDetailResponseDto) }],
    },
  })
  async getActive(@CurrentPrincipal() principal: AuthenticatedPrincipal) {
    try {
      return await this.getActiveWorkout.execute(principal.userId);
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Get('exercises/:exerciseId/history')
  @ApiOperation({ summary: 'Get workout history for an exercise' })
  @ApiParam({ name: 'exerciseId', format: 'uuid' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({ name: 'to', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, type: [ExerciseHistoryResponseDto] })
  async getExerciseHistory(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('exerciseId') exerciseId: string,
    @Query() query: GetExerciseHistoryQueryDto,
  ) {
    try {
      return await this.getExerciseHistoryUseCase.execute({
        ...query,
        ownerId: principal.userId,
        exerciseId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List workout history' })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    maxLength: 100,
    description: 'Case-insensitive partial match against the routine name.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({ name: 'to', required: false, type: String, format: 'date-time' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, type: [WorkoutSessionListItemResponseDto] })
  async listHistory(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Query() query: ListWorkoutHistoryQueryDto,
  ) {
    try {
      return await this.listWorkoutHistory.execute({
        ...query,
        ownerId: principal.userId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Get(':workoutSessionId')
  @ApiOperation({ summary: 'Get one workout session' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiResponse({ status: 200, type: WorkoutSessionDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async getOne(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
  ) {
    try {
      return await this.getWorkout.execute({
        ownerId: principal.userId,
        workoutSessionId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Post(':workoutSessionId/exercises')
  @ApiOperation({ summary: 'Add an exercise to a workout' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiBody({ type: AddWorkoutExerciseDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  @ApiResponse({
    status: 422,
    description: 'The requested exercise is unavailable',
  })
  async addExercise(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Body() dto: AddWorkoutExerciseDto,
  ) {
    try {
      return await this.addWorkoutExercise.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Delete(':workoutSessionId/exercises')
  @ApiOperation({ summary: 'Remove an exercise from a workout' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiBody({ type: RemoveWorkoutExerciseDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Workout session or exercise not found',
  })
  async removeExercise(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Body() dto: RemoveWorkoutExerciseDto,
  ) {
    try {
      return await this.removeWorkoutExercise.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Post(':workoutSessionId/exercises/:exercisePerformanceId/sets')
  @ApiOperation({ summary: 'Record a completed set' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiParam({ name: 'exercisePerformanceId', format: 'uuid' })
  @ApiBody({ type: RecordWorkoutSetDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({
    status: 404,
    description: 'Workout session or exercise not found',
  })
  async recordSet(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Param('exercisePerformanceId') exercisePerformanceId: string,
    @Body() dto: RecordWorkoutSetDto,
  ) {
    try {
      return await this.recordWorkoutSet.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
        exercisePerformanceId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Patch(
    ':workoutSessionId/exercises/:exercisePerformanceId/sets/:completedSetId',
  )
  @ApiOperation({ summary: 'Update a completed set' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiParam({ name: 'exercisePerformanceId', format: 'uuid' })
  @ApiParam({ name: 'completedSetId', format: 'uuid' })
  @ApiBody({ type: UpdateWorkoutSetDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session or set not found' })
  async updateSet(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Param('exercisePerformanceId') exercisePerformanceId: string,
    @Param('completedSetId') completedSetId: string,
    @Body() dto: UpdateWorkoutSetDto,
  ) {
    try {
      return await this.updateWorkoutSet.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
        exercisePerformanceId,
        completedSetId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Delete(
    ':workoutSessionId/exercises/:exercisePerformanceId/sets/:completedSetId',
  )
  @ApiOperation({ summary: 'Delete a completed set' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiParam({ name: 'exercisePerformanceId', format: 'uuid' })
  @ApiParam({ name: 'completedSetId', format: 'uuid' })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session or set not found' })
  async deleteSet(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Param('exercisePerformanceId') exercisePerformanceId: string,
    @Param('completedSetId') completedSetId: string,
    @Body() dto: DeleteWorkoutSetDto,
  ) {
    void dto;
    try {
      return await this.deleteWorkoutSet.execute({
        ownerId: principal.userId,
        workoutSessionId,
        exercisePerformanceId,
        completedSetId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Post(':workoutSessionId/complete')
  @ApiOperation({ summary: 'Complete a workout' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiBody({ type: CompleteWorkoutDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async complete(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Body() dto: CompleteWorkoutDto,
  ) {
    try {
      return await this.completeWorkout.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }

  @Post(':workoutSessionId/cancel')
  @ApiOperation({ summary: 'Cancel a workout' })
  @ApiParam({ name: 'workoutSessionId', format: 'uuid' })
  @ApiBody({ type: CancelWorkoutDto })
  @ApiResponse({ status: 200, type: WorkoutSessionMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Workout session not found' })
  async cancel(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('workoutSessionId') workoutSessionId: string,
    @Body() dto: CancelWorkoutDto,
  ) {
    try {
      return await this.cancelWorkout.execute({
        ...dto,
        ownerId: principal.userId,
        workoutSessionId,
      });
    } catch (error) {
      throw toWorkoutSessionsHttpException(error);
    }
  }
}
