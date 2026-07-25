import {
  BodyPosition,
  ContractionMode,
  ForceType,
  KineticChain,
  Laterality,
  MuscleRole,
  SkillLevel,
} from '../../../generated/prisma/client';

import type { ExerciseSeed } from '../types';
import { createExercise } from './create-exercise';

export const powerExercises: ExerciseSeed[] = [
  createExercise({
    name: 'Power Clean',
    slug: 'power-clean',
    description:
      'An Olympic-lift derivative that accelerates a barbell from the floor and receives it on the front shoulders to develop whole-body power.',
    instructions:
      'Set up over the bar with a braced back, push from the floor, and keep the bar close. Extend the hips, knees, and ankles rapidly, pull under into a partial squat, receive on the shoulders, then stand and lower safely.',
    commonMistakes:
      'Pulling early with the arms, letting the bar drift forward, jumping forward, catching with low elbows, or losing spinal position from the floor.',
    imageAltText: 'Athlete receiving a barbell power clean',
    classification: [
      'olympic-pull',
      ForceType.PULL,
      KineticChain.MIXED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'weight-plates'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['hamstrings', MuscleRole.SECONDARY, 4],
      ['upper-trapezius', MuscleRole.SECONDARY, 4],
      ['erector-spinae', MuscleRole.STABILIZER, 4],
      ['forearm-flexors', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [3, 4, 5, 2, 4, 5, 3, 3],
    demandScores: [5, 4, 5, 5, 4, 5, 4, 5],
  }),
  createExercise({
    name: 'Hang Power Clean',
    slug: 'hang-power-clean',
    description:
      'An explosive clean variation initiated above the floor to emphasize rapid extension, timing, and receiving skill.',
    instructions:
      'Stand with the bar, hinge to the chosen hang position, and maintain tension. Drive rapidly through the hips and legs, keep the bar close, pull under to receive it on the shoulders in a partial squat, then stand.',
    commonMistakes:
      'Drifting onto the toes early, swinging the bar away, pulling with the arms first, failing to finish extension, or catching with collapsed posture.',
    imageAltText: 'Athlete performing a hang power clean',
    classification: [
      'olympic-pull',
      ForceType.PULL,
      KineticChain.MIXED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'weight-plates'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['quadriceps', MuscleRole.PRIMARY, 4],
      ['hamstrings', MuscleRole.SECONDARY, 4],
      ['upper-trapezius', MuscleRole.SECONDARY, 4],
      ['erector-spinae', MuscleRole.STABILIZER, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [3, 3, 5, 2, 4, 4, 3, 3],
    demandScores: [5, 3, 5, 5, 4, 5, 4, 4],
  }),
  createExercise({
    name: 'High Pull',
    slug: 'high-pull',
    description:
      'An explosive pull that drives a barbell upward through powerful hip and knee extension without a catch.',
    instructions:
      'Start from the floor or hang with the bar close and trunk braced. Extend the hips, knees, and ankles forcefully, allow the elbows to travel high after extension, then control the bar back to the start.',
    commonMistakes:
      'Rowing before hip extension, pulling slowly, letting the bar loop forward, overusing the arms, or lowering without control.',
    imageAltText: 'Athlete performing a barbell high pull',
    classification: [
      'olympic-pull',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'weight-plates'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['quadriceps', MuscleRole.PRIMARY, 4],
      ['upper-trapezius', MuscleRole.PRIMARY, 4],
      ['hamstrings', MuscleRole.SECONDARY, 4],
      ['lateral-deltoid', MuscleRole.SECONDARY, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [3, 3, 5, 2, 3, 4, 2, 3],
    demandScores: [4, 3, 4, 5, 3, 4, 4, 4],
  }),
  createExercise({
    name: 'Barbell Jump Squat',
    slug: 'barbell-jump-squat',
    description:
      'A lightly loaded ballistic squat that develops lower-body rate of force by accelerating through takeoff.',
    instructions:
      'Use a light bar securely across the upper back, brace, and descend into a shallow controlled squat. Drive explosively to leave the floor, land softly with knees tracking over the feet, reset balance, and repeat.',
    commonMistakes:
      'Using excessive load, landing stiff-legged, letting the knees collapse, turning each rep into a deep grind, or failing to reset.',
    imageAltText: 'Athlete performing a lightly loaded barbell jump squat',
    classification: [
      'jump',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'squat-rack'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 4],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['hamstrings', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 2, 5, 3, 4, 3, 3, 3],
    demandScores: [4, 4, 5, 5, 4, 4, 2, 4],
  }),
  createExercise({
    name: 'Box Jump',
    slug: 'box-jump',
    description:
      'A bodyweight jump onto a stable platform that develops explosive lower-body force and landing control.',
    instructions:
      'Stand a short distance from the box, load the hips and arms, then jump upward and forward. Land quietly with the whole feet on the box and knees aligned, stand under control, and step down.',
    commonMistakes:
      'Choosing an excessive box height, landing in a very deep squat, knees collapsing, jumping from too far away, or jumping down when fatigued.',
    imageAltText: 'Athlete landing a box jump on a plyometric box',
    classification: [
      'jump',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight', 'plyometric-box'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 4],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['hamstrings', MuscleRole.SECONDARY, 3],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [1, 1, 5, 3, 4, 1, 2, 3],
    demandScores: [4, 1, 5, 5, 3, 4, 0, 2],
  }),
  createExercise({
    name: 'Medicine Ball Chest Throw',
    slug: 'medicine-ball-chest-throw',
    description:
      'A ballistic horizontal throw that develops upper-body pressing power by projecting a medicine ball from the chest.',
    instructions:
      'Stand in an athletic stance facing a wall or partner with the ball at the chest. Brace, drive through the floor, extend the arms rapidly to throw straight forward, and receive or retrieve the ball only after establishing control.',
    commonMistakes:
      'Using a ball that is too heavy, throwing downward, overextending the back, letting the elbows flare excessively, or catching without readiness.',
    imageAltText: 'Athlete throwing a medicine ball from the chest',
    classification: [
      'throw',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['medicine-ball'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.PRIMARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 4],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 2, 5, 3, 3, 2, 2, 3],
    demandScores: [3, 1, 4, 4, 3, 3, 1, 1],
  }),
];
