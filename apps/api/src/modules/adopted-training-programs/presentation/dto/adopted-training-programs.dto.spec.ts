import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdoptTrainingProgramDto } from './adopt-training-program.dto';
import { StartProgramWorkoutOccurrenceDto } from './start-program-workout-occurrence.dto';

describe('adopted training program DTOs', () => {
  it('trims and validates an adoption slug', async () => {
    const dto = plainToInstance(AdoptTrainingProgramDto, {
      sourceProgramSlug: ' strength-base ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.sourceProgramSlug).toBe('strength-base');
  });

  it('rejects malformed adoption slugs', async () => {
    const dto = plainToInstance(AdoptTrainingProgramDto, {
      sourceProgramSlug: 'Strength Base',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it('accepts the canonical slug maximum and rejects a longer slug', async () => {
    // Failure mode: BC-01
    // Arrange
    const maximum = plainToInstance(AdoptTrainingProgramDto, {
      sourceProgramSlug: 'a'.repeat(120),
    });
    const tooLong = plainToInstance(AdoptTrainingProgramDto, {
      sourceProgramSlug: 'a'.repeat(121),
    });

    // Act
    const [maximumErrors, tooLongErrors] = await Promise.all([
      validate(maximum),
      validate(tooLong),
    ]);

    // Assert
    expect(maximumErrors).toHaveLength(0);
    expect(tooLongErrors).not.toHaveLength(0);
  });

  it('validates and transforms an occurrence start body', async () => {
    const dto = plainToInstance(StartProgramWorkoutOccurrenceDto, {
      timezone: ' Asia/Qatar ',
      startedAt: '2026-08-31T10:00:00.000Z',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.timezone).toBe('Asia/Qatar');
    expect(dto.startedAt).toBeInstanceOf(Date);
  });

  it('accepts an omitted start timestamp but rejects explicit null', async () => {
    // Failure mode: NE-02
    // Arrange
    const omitted = plainToInstance(StartProgramWorkoutOccurrenceDto, {
      timezone: 'Asia/Qatar',
    });
    const explicitNull = plainToInstance(StartProgramWorkoutOccurrenceDto, {
      timezone: 'Asia/Qatar',
      startedAt: null,
    });

    // Act
    const [omittedErrors, explicitNullErrors] = await Promise.all([
      validate(omitted),
      validate(explicitNull),
    ]);

    // Assert
    expect(omittedErrors).toHaveLength(0);
    expect(explicitNullErrors).not.toHaveLength(0);
  });
});
