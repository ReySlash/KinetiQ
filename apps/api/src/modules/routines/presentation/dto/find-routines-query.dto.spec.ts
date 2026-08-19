import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindRoutinesQueryDto } from './find-routines-query.dto';

describe('FindRoutinesQueryDto', () => {
  it.each(['my', 'global'])('accepts the %s scope', async (scope) => {
    const dto = plainToInstance(FindRoutinesQueryDto, { scope });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported scope', async () => {
    const dto = plainToInstance(FindRoutinesQueryDto, { scope: 'public' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('scope');
  });
});
