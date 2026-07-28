import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class FindExercisesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  search?: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(20)
  limit?: number;
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(0)
  offset?: number;
}
