import { ArchiveExerciseUseCase } from '../application/use-cases/commands/archive-exercise.use-case';
import { CreateExerciseUseCase } from '../application/use-cases/commands/create-exercise.use-case';
import { UpdateExerciseUseCase } from '../application/use-cases/commands/update-exercise.use-case';
import { AdminExercisesController } from './admin-exercises.controller';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

describe('AdminExercisesController', () => {
  it('delegates create and returns a success message', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'id', slug: 'squat' });
    const controller = new AdminExercisesController(
      { execute: create } as CreateExerciseUseCase,
      { execute: jest.fn() } as UpdateExerciseUseCase,
      { execute: jest.fn() } as ArchiveExerciseUseCase,
    );
    const dto = new CreateExerciseDto();

    await expect(controller.create(dto)).resolves.toEqual({
      id: 'id',
      slug: 'squat',
      message: 'Exercise created successfully',
    });
    expect(create).toHaveBeenCalledWith(dto);
  });

  it('delegates update and archive', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'id', slug: 'squat' });
    const archive = jest
      .fn()
      .mockResolvedValue({ id: 'id', archivedAt: new Date() });
    const controller = new AdminExercisesController(
      { execute: jest.fn() } as CreateExerciseUseCase,
      { execute: update } as UpdateExerciseUseCase,
      { execute: archive } as ArchiveExerciseUseCase,
    );

    const dto = new UpdateExerciseDto();
    await expect(controller.update('id', dto)).resolves.toEqual({
      id: 'id',
      slug: 'squat',
      message: 'Exercise updated successfully',
    });
    await expect(controller.archive('id')).resolves.toEqual(
      expect.objectContaining({
        id: 'id',
        message: 'Exercise archived successfully',
      }),
    );
    expect(update).toHaveBeenCalledWith('id', dto);
    expect(archive).toHaveBeenCalledWith('id');
  });
});
