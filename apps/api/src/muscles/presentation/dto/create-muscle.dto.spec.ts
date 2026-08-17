import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateMuscleDto } from './create-muscle.dto';

describe('CreateMuscleDto', () => {
  it('trims name and slug values', () => {
    const dto = plainToInstance(CreateMuscleDto, {
      name: '  Biceps Brachii  ',
      slug: '  bench-press  ',
    });

    expect(dto.name).toBe('Biceps Brachii');
    expect(dto.slug).toBe('bench-press');
  });

  it('rejects whitespace-only name and slug after trimming', () => {
    const dto = plainToInstance(CreateMuscleDto, {
      name: '   ',
      slug: '   ',
      description: 'Primary elbow flexor of the upper arm.',
      bodyRegion: 'UPPER_BODY',
    });

    const errors = validateSync(dto);
    const properties = errors.map(({ property }) => property);

    expect(properties).toEqual(expect.arrayContaining(['name', 'slug']));
  });
});
