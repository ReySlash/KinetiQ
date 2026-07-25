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

export const calvesExercises: ExerciseSeed[] = [
  {
    name: 'Standing Calf Raise',
    slug: 'standing-calf-raise',
    description:
      'An ankle plantar-flexion exercise emphasizing the gastrocnemius while also training the soleus.',
    instructions:
      'Stand with the forefoot supported and the heels free to move. Keep the knees mostly extended, lower the heels under control, and press through the balls of the feet to raise the heels as high as possible without rolling the ankles outward.',
    commonMistakes:
      'Bouncing through the bottom, using a shortened range of motion, allowing the ankles to roll outward, bending the knees excessively, or performing repetitions too quickly.',
    movementPatternSlug: 'ankle-plantar-flexion-pattern',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.CLOSED,
    isCompound: false,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.BEGINNER,
    imageAltText: 'Athlete performing a standing calf raise',
    equipmentSlugs: ['bodyweight'],
    muscles: [
      {
        muscleSlug: 'gastrocnemius',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'soleus',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'tibialis-anterior',
        role: MuscleRole.STABILIZER,
        involvementScore: 1,
      },
    ],
    capabilities: {
      hypertrophyPotential: 4,
      maximalStrengthPotential: 2,
      powerDevelopmentPotential: 2,
      muscularEndurancePotential: 5,
      stabilityDevelopmentPotential: 2,
      typicalLoadability: 4,
      stretchPositionLoading: 5,
      shortenedPositionLoading: 5,
    },
    demands: {
      technicalDemand: 1,
      setupComplexity: 1,
      stabilityDemand: 2,
      systemicFatiguePotential: 1,
      localFatiguePotential: 5,
      recoveryCostPotential: 2,
      gripDemand: 0,
      axialLoadingPotential: 1,
    },
  },
  createExercise({
    name: 'Seated Calf Raise',
    slug: 'seated-calf-raise',
    description:
      'A bent-knee plantar-flexion exercise that emphasizes the soleus under direct machine resistance.',
    instructions:
      'Sit with the knees bent around ninety degrees and secure the pads above them. Lower the heels slowly into dorsiflexion, press through the forefeet to raise them fully, pause, and return under control.',
    commonMistakes:
      'Bouncing, using a shallow range, rolling the ankles outward, moving the knees, or letting the load drop.',
    imageAltText: 'Athlete performing a seated machine calf raise',
    classification: [
      'ankle-plantar-flexion-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['calf-raise-machine'],
    muscles: [
      ['soleus', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 2],
      ['tibialis-anterior', MuscleRole.STABILIZER, 1],
    ],
    capabilityScores: [5, 2, 2, 5, 1, 4, 5, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 1],
  }),
  createExercise({
    name: 'Leg Press Calf Raise',
    slug: 'leg-press-calf-raise',
    description:
      'A supported straight-knee calf raise performed on a leg press for high plantar-flexion loadability.',
    instructions:
      'Place the balls of the feet on the lower platform with knees softly extended. Let the heels travel toward you under control, press the platform away through the forefeet, pause high, and keep the ankles tracking straight.',
    commonMistakes:
      'Allowing the feet to slip, bending the knees, bouncing, locking the knees aggressively, or using only partial ankle range.',
    imageAltText: 'Athlete performing calf raises on a leg press',
    classification: [
      'ankle-plantar-flexion-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['leg-press-machine'],
    muscles: [
      ['gastrocnemius', MuscleRole.PRIMARY, 5],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['tibialis-anterior', MuscleRole.STABILIZER, 1],
    ],
    capabilityScores: [5, 3, 2, 5, 1, 5, 5, 5],
    demandScores: [2, 2, 1, 1, 5, 2, 0, 1],
  }),
  createExercise({
    name: 'Single-leg Calf Raise',
    slug: 'single-leg-calf-raise',
    description:
      'A unilateral bodyweight plantar-flexion exercise that trains each calf and challenges ankle balance independently.',
    instructions:
      'Stand on one forefoot with light hand support and the heel free. Lower slowly, press through the ball of the foot to full height, keep the ankle straight, and complete the set before changing sides.',
    commonMistakes:
      'Pushing heavily with the support hand, rolling the ankle, bending the knee, bouncing, or shortening the bottom range.',
    imageAltText: 'Athlete performing a single-leg calf raise',
    classification: [
      'ankle-plantar-flexion-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['gastrocnemius', MuscleRole.PRIMARY, 5],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['tibialis-anterior', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 2, 5, 4, 2, 5, 5],
    demandScores: [2, 0, 4, 1, 5, 2, 0, 1],
  }),
  createExercise({
    name: 'Donkey Calf Raise',
    slug: 'donkey-calf-raise',
    description:
      'A hip-flexed straight-knee calf raise that trains the gastrocnemius through a large ankle range.',
    instructions:
      'Hinge forward with hands supported and keep the knees nearly straight. Lower the heels under control, press through the forefeet to raise them as high as possible, and keep the spine and ankles stable.',
    commonMistakes:
      'Rounding excessively, bending the knees, bouncing, rolling onto the outer feet, or using a shortened range.',
    imageAltText: 'Athlete performing a supported donkey calf raise',
    classification: [
      'ankle-plantar-flexion-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.HINGED,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['gastrocnemius', MuscleRole.PRIMARY, 5],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 1, 5, 2, 3, 5, 5],
    demandScores: [2, 1, 2, 1, 5, 2, 0, 1],
  }),
  createExercise({
    name: 'Tibialis Raise',
    slug: 'tibialis-raise',
    description:
      'A dorsiflexion exercise that strengthens the tibialis anterior by lifting the forefoot toward the shin.',
    instructions:
      'Lean the back against a wall with the feet slightly forward and heels planted. Raise the toes and forefeet as high as possible, pause, and lower slowly without shifting the hips.',
    commonMistakes:
      'Rocking the body, lifting the heels, turning the feet outward, using momentum, or shortening the lowering phase.',
    imageAltText:
      'Athlete performing bodyweight tibialis raises against a wall',
    classification: [
      'ankle-dorsiflexion-pattern',
      ForceType.PULL,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['tibialis-anterior', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.STABILIZER, 1],
    ],
    capabilityScores: [4, 1, 1, 5, 2, 1, 4, 5],
    demandScores: [1, 0, 2, 1, 5, 1, 0, 0],
  }),
];
