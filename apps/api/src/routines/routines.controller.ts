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
import {
  CurrentOptionalPrincipal,
  CurrentPrincipal,
  type AuthenticatedPrincipal,
} from '../modules/shared/infrastructure/auth/principal';
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
  findAll(
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
    @Query() query: FindRoutinesQueryDto,
  ) {
    return this.routinesService.findAll(principal, query);
  }

  @Get(':slug')
  @OptionalAuth()
  @ApiOperation({ summary: 'Get an owned or global routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineDetailDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  findOne(
    @CurrentOptionalPrincipal() principal: AuthenticatedPrincipal | null,
    @Param('slug') slug: string,
  ) {
    return this.routinesService.findOne(principal, slug);
  }

  @Patch(':slug')
  @ApiOperation({ summary: 'Update an owned routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  update(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(principal, slug, dto);
  }

  @Delete(':slug')
  @ApiOperation({ summary: 'Delete an owned routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 200, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  remove(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
  ) {
    return this.routinesService.remove(principal, slug);
  }

  @Post(':slug/duplicate')
  @ApiOperation({ summary: 'Duplicate an owned or global routine' })
  @ApiParam({ name: 'slug', example: 'upper-body-a' })
  @ApiResponse({ status: 201, type: RoutineMutationResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  duplicate(
    @CurrentPrincipal() principal: AuthenticatedPrincipal,
    @Param('slug') slug: string,
  ) {
    return this.routinesService.duplicate(principal, slug);
  }
}
