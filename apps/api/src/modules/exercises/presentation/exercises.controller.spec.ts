import { GetExerciseUseCase } from '../application/use-cases/queries/get-exercise.use-case';
import { ListExercisesUseCase } from '../application/use-cases/queries/list-exercises.use-case';
import { ExercisesController } from './exercises.controller';

describe('ExercisesController', () => {
  it('delegates list requests to the list use case', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const controller = new ExercisesController(
      { execute: list } as ListExercisesUseCase,
      { execute: jest.fn() } as GetExerciseUseCase,
    );
    const query = { limit: 10, offset: 20, search: 'press' };

    await expect(controller.findAll(query)).resolves.toEqual([]);
    expect(list).toHaveBeenCalledWith(query);
  });

  it('delegates detail requests to the get use case', async () => {
    const exercise = { name: 'Barbell Back Squat', slug: 'barbell-back-squat' };
    const get = jest.fn().mockResolvedValue(exercise);
    const controller = new ExercisesController(
      { execute: jest.fn() } as ListExercisesUseCase,
      { execute: get } as GetExerciseUseCase,
    );

    await expect(controller.findOne('barbell-back-squat')).resolves.toEqual(
      exercise,
    );
    expect(get).toHaveBeenCalledWith('barbell-back-squat');
  });
});
