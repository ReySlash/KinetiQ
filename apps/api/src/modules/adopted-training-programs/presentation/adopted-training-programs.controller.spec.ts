import 'reflect-metadata';

import type { AuthenticatedPrincipal } from '../../shared/infrastructure/auth/principal';
import { AdoptTrainingProgramDto } from './dto/adopt-training-program.dto';
import { StartProgramWorkoutOccurrenceDto } from './dto/start-program-workout-occurrence.dto';
import { AdoptedTrainingProgramsController } from './adopted-training-programs.controller';

const principal: AuthenticatedPrincipal = {
  userId: '123e4567-e89b-12d3-a456-426614174000',
  role: 'USER',
  sessionId: '223e4567-e89b-12d3-a456-426614174000',
};
const programId = '323e4567-e89b-12d3-a456-426614174000';
const occurrenceId = '423e4567-e89b-12d3-a456-426614174000';

describe('AdoptedTrainingProgramsController', () => {
  const useCases = {
    adopt: { execute: jest.fn() },
    active: { execute: jest.fn() },
    detail: { execute: jest.fn() },
    pause: { execute: jest.fn() },
    resume: { execute: jest.fn() },
    cancel: { execute: jest.fn() },
    start: { execute: jest.fn() },
    skip: { execute: jest.fn() },
  };
  let controller: AdoptedTrainingProgramsController;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(useCases).forEach((useCase) =>
      useCase.execute.mockResolvedValue({}),
    );
    controller = new AdoptedTrainingProgramsController(
      useCases.adopt as never,
      useCases.active as never,
      useCases.detail as never,
      useCases.pause as never,
      useCases.resume as never,
      useCases.cancel as never,
      useCases.start as never,
      useCases.skip as never,
    );
  });

  it('propagates the principal and adoption payload', async () => {
    const dto = Object.assign(new AdoptTrainingProgramDto(), {
      sourceProgramSlug: 'strength-base',
    });

    await controller.adopt(principal, dto);

    expect(useCases.adopt.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      sourceProgramSlug: dto.sourceProgramSlug,
    });
  });

  it('routes reads and lifecycle commands with owner scope', async () => {
    await controller.getActive(principal);
    await controller.getOne(principal, programId);
    await controller.pause(principal, programId);
    await controller.resume(principal, programId);
    await controller.cancel(principal, programId);

    expect(useCases.active.execute).toHaveBeenCalledWith(principal.userId);
    expect(useCases.detail.execute).toHaveBeenCalledWith(
      programId,
      principal.userId,
    );
    for (const useCase of [useCases.pause, useCases.resume, useCases.cancel]) {
      expect(useCase.execute).toHaveBeenCalledWith({
        ownerId: principal.userId,
        adoptedTrainingProgramId: programId,
      });
    }
  });

  it('routes start and skip commands with both owned identifiers', async () => {
    const dto = Object.assign(new StartProgramWorkoutOccurrenceDto(), {
      timezone: 'Asia/Qatar',
      startedAt: new Date('2026-08-31T10:00:00.000Z'),
    });

    await controller.start(principal, programId, occurrenceId, dto);
    await controller.skip(principal, programId, occurrenceId);

    expect(useCases.start.execute).toHaveBeenCalledWith({
      ...dto,
      ownerId: principal.userId,
      adoptedTrainingProgramId: programId,
      occurrenceId,
    });
    expect(useCases.skip.execute).toHaveBeenCalledWith({
      ownerId: principal.userId,
      adoptedTrainingProgramId: programId,
      occurrenceId,
    });
  });
});
