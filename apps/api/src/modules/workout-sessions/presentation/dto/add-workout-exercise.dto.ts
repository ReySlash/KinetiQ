import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AddWorkoutExerciseDto {
  @ApiProperty({ format: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  workoutSessionId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  exerciseId!: string;
}
