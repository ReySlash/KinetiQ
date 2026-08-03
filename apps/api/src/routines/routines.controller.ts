import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import {
  CurrentPrincipal,
  type AuthenticatedPrincipal,
} from '../auth/principal';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { FindRoutinesQueryDto } from './dto/find-routines-query.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import {
  RoutineDetailDto,
  RoutineListItemDto,
  RoutineMutationResponseDto,
} from './dto/routine-response.dto';
import { RoutinesService } from './routines.service';

@Controller('routines')
@ApiTags('routines')
@ApiCookieAuth('better-auth.session_token')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an owned routine' })
  @ApiResponse({ status: 201, type: RoutineMutationResponseDto })
  create(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Body() dto: CreateRoutineDto,
  ) {
    return this.routinesService.create(principal, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List owned routines' })
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
  findAll(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Query() query: FindRoutinesQueryDto,
  ) {
    return this.routinesService.findAll(principal, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an owned routine' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: RoutineDetailDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  findOne(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.routinesService.findOne(principal, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an owned routine' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  update(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(principal, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an owned routine' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  remove(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.routinesService.remove(principal, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an owned routine' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 201, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  duplicate(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.routinesService.duplicate(principal, id);
  }
}
