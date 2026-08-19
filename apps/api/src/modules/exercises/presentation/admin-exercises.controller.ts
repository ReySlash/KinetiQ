import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { Roles } from '@thallesp/nestjs-better-auth';
import { ArchiveExerciseUseCase } from '../application/use-cases/commands/archive-exercise.use-case';
import { CreateExerciseUseCase } from '../application/use-cases/commands/create-exercise.use-case';
import { UpdateExerciseUseCase } from '../application/use-cases/commands/update-exercise.use-case';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { toExercisesHttpException } from './exercises-exception.mapper';

@Controller('admin/exercises')
@ApiTags('admin/exercises')
@ApiCookieAuth('better-auth.session_token')
@Roles(['ADMIN'])
export class AdminExercisesController {
  constructor(
    private readonly createExercise: CreateExerciseUseCase,
    private readonly updateExercise: UpdateExerciseUseCase,
    private readonly archiveExercise: ArchiveExerciseUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an exercise' })
  @ApiBody({ type: CreateExerciseDto })
  @ApiResponse({ status: 201 })
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    try {
      const result = await this.createExercise.execute(createExerciseDto);
      return { ...result, message: 'Exercise created successfully' };
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exercise' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateExerciseDto })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    try {
      const result = await this.updateExercise.execute(id, updateExerciseDto);
      return { ...result, message: 'Exercise updated successfully' };
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive an exercise' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async archive(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const result = await this.archiveExercise.execute(id);
      return { ...result, message: 'Exercise archived successfully' };
    } catch (error) {
      throw toExercisesHttpException(error);
    }
  }
}
