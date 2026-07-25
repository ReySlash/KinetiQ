import { armsExercises } from './arms';
import { backExercises } from './back';
import { calvesExercises } from './calves';
import { chestExercises } from './chest';
import { conditioningExercises } from './conditioning';
import { coreExercises } from './core';
import { correctiveExercises } from './corrective';
import { glutesExercises } from './glutes';
import { posteriorChainExercises } from './posterior-chain';
import { powerExercises } from './power';
import { quadricepsExercises } from './quadriceps';
import { shouldersExercises } from './shoulders';

import type { ExerciseCategory, ExerciseSeed } from '../types';

export const exerciseCategories: ExerciseCategory[] = [
  { name: 'Chest', slug: 'chest', exercises: chestExercises },
  { name: 'Back', slug: 'back', exercises: backExercises },
  { name: 'Shoulders', slug: 'shoulders', exercises: shouldersExercises },
  { name: 'Arms', slug: 'arms', exercises: armsExercises },
  {
    name: 'Quadriceps',
    slug: 'quadriceps',
    exercises: quadricepsExercises,
  },
  {
    name: 'Posterior chain',
    slug: 'posterior-chain',
    exercises: posteriorChainExercises,
  },
  { name: 'Glutes', slug: 'glutes', exercises: glutesExercises },
  { name: 'Calves and lower legs', slug: 'calves', exercises: calvesExercises },
  { name: 'Core', slug: 'core', exercises: coreExercises },
  { name: 'Power and athletic', slug: 'power', exercises: powerExercises },
  {
    name: 'Carries and conditioning',
    slug: 'conditioning',
    exercises: conditioningExercises,
  },
  {
    name: 'Corrective and accessory',
    slug: 'corrective',
    exercises: correctiveExercises,
  },
];

export const exercises: ExerciseSeed[] = exerciseCategories.flatMap(
  ({ exercises: categoryExercises }) => categoryExercises,
);
