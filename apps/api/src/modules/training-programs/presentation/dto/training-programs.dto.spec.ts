import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTrainingProgramDto } from './create-training-program.dto';
import { ListTrainingProgramsQueryDto } from './list-training-programs-query.dto';

describe('Training program HTTP DTOs', () => {
  it('transforms and validates nested schedule entries', async () => {
    const dto = plainToInstance(CreateTrainingProgramDto, {
      name: '  Strength Base  ',
      durationWeeks: 4,
      schedule: [
        {
          routineSlug: '  upper-a  ',
          weekNumber: 1,
          dayNumber: 1,
          notes: '  Start here  ',
        },
      ],
    });

    await expect(validate(dto)).resolves.toEqual([]);
    expect(dto).toMatchObject({
      name: 'Strength Base',
      schedule: [
        {
          routineSlug: 'upper-a',
          weekNumber: 1,
          dayNumber: 1,
          notes: 'Start here',
        },
      ],
    });
  });

  it('rejects malformed nested schedule values', async () => {
    const dto = plainToInstance(CreateTrainingProgramDto, {
      name: 'Strength Base',
      durationWeeks: 4,
      schedule: [{ routineSlug: ' ', weekNumber: 0, dayNumber: 0 }],
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'schedule')).toBe(true);
  });

  it('rejects list limits above the approved maximum', async () => {
    const dto = plainToInstance(ListTrainingProgramsQueryDto, { limit: 101 });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'limit')).toBe(true);
  });
});
