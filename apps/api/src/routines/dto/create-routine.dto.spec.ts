import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoutineDto } from './create-routine.dto';

const exerciseId = '423e4567-e89b-12d3-a456-426614174000';

async function validateRoutine(input: unknown) {
  const dto = plainToInstance(CreateRoutineDto, input);
  return validate(dto);
}

describe('CreateRoutineDto', () => {
  it('accepts an empty routine and normalizes optional strings', async () => {
    const dto = plainToInstance(CreateRoutineDto, {
      name: '  Upper Body  ',
      description: '  Pressing day  ',
      exercises: [],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Upper Body');
    expect(dto.description).toBe('Pressing day');
  });

  it('rejects invalid rep ranges and tempo notation', async () => {
    const errors = await validateRoutine({
      name: 'Upper Body',
      exercises: [
        {
          exerciseId,
          sets: 3,
          minReps: 12,
          maxReps: 8,
          tempo: '3-1-X',
        },
      ],
    });

    expect(errors).toHaveLength(1);
    const serializedErrors = JSON.stringify(errors);
    expect(serializedErrors).toContain('maxRepsValidator');
    expect(serializedErrors).toContain('matches');
  });
});
