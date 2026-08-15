import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TRAINING_PROGRAM_SCOPES,
  TRAINING_PROGRAM_SORTS,
  type TrainingProgramScope,
  type TrainingProgramSort,
} from '../../application/models/list-training-programs.model';

export class ListTrainingProgramsQueryDto {
  @IsOptional()
  @IsIn(TRAINING_PROGRAM_SCOPES)
  scope?: TrainingProgramScope;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(TRAINING_PROGRAM_SORTS)
  sort?: TrainingProgramSort;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
