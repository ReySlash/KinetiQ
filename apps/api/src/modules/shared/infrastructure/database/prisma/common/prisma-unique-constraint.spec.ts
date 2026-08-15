import { BadRequestException } from '@nestjs/common';
import { toPrismaUniqueConstraintBadRequest } from './prisma-unique-constraint';

describe('toPrismaUniqueConstraintBadRequest', () => {
  it('maps the detected field into a BadRequestException', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['slug'] },
    };

    const result = toPrismaUniqueConstraintBadRequest(error, {
      entityLabel: 'muscle',
      fieldMessages: {
        slug: 'A muscle with that slug already exists',
      },
    });

    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getResponse()).toMatchObject({
      message: 'A muscle with that slug already exists',
      field: 'slug',
    });
  });

  it('uses the caller resolver when provided', () => {
    const error = {
      code: 'P2002',
      meta: { target: ['slug'] },
    };

    const result = toPrismaUniqueConstraintBadRequest(error, {
      entityLabel: 'muscle',
      resolveField: () => 'name',
      fieldMessages: {
        name: 'A muscle with that name already exists',
        slug: 'A muscle with that slug already exists',
      },
    });

    expect(result?.getResponse()).toMatchObject({
      message: 'A muscle with that name already exists',
      field: 'name',
    });
  });

  it('returns undefined for non-unique errors', () => {
    const result = toPrismaUniqueConstraintBadRequest(new Error('boom'), {
      entityLabel: 'muscle',
      fieldMessages: {},
    });

    expect(result).toBeUndefined();
  });
});
