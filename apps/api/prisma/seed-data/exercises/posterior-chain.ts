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

export const posteriorChainExercises: ExerciseSeed[] = [
  {
    name: 'Romanian Deadlift',
    slug: 'romanian-deadlift',
    description:
      'A hip-hinge exercise emphasizing the hamstrings and gluteus maximus through controlled hip flexion and extension.',
    instructions:
      'Stand while holding the bar in front of the thighs. Brace the trunk, soften the knees, and push the hips backward while keeping the bar close to the legs. Descend until a strong hamstring stretch is reached without losing spinal position, then extend the hips to return to standing.',
    commonMistakes:
      'Turning the movement into a squat, allowing the bar to drift away from the legs, rounding the spine, forcing excessive depth, or hyperextending the lower back at lockout.',
    movementPatternSlug: 'hip-hinge',
    forceType: ForceType.PULL,
    kineticChain: KineticChain.CLOSED,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.HINGED,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing a barbell Romanian deadlift',
    equipmentSlugs: ['barbell'],
    muscles: [
      {
        muscleSlug: 'hamstrings',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'gluteus-maximus',
        role: MuscleRole.PRIMARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'adductor-magnus',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'erector-spinae',
        role: MuscleRole.STABILIZER,
        involvementScore: 4,
      },
      {
        muscleSlug: 'forearm-flexors',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
      {
        muscleSlug: 'transverse-abdominis',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
    ],
    capabilities: {
      hypertrophyPotential: 5,
      maximalStrengthPotential: 4,
      powerDevelopmentPotential: 3,
      muscularEndurancePotential: 2,
      stabilityDevelopmentPotential: 3,
      typicalLoadability: 5,
      stretchPositionLoading: 5,
      shortenedPositionLoading: 2,
    },
    demands: {
      technicalDemand: 4,
      setupComplexity: 2,
      stabilityDemand: 4,
      systemicFatiguePotential: 4,
      localFatiguePotential: 5,
      recoveryCostPotential: 4,
      gripDemand: 4,
      axialLoadingPotential: 4,
    },
  },
  createExercise({
    name: 'Stiff-leg Deadlift',
    slug: 'stiff-leg-deadlift',
    description:
      'A barbell hinge using minimal knee bend to load the hamstrings and spinal extensors through a long range.',
    instructions:
      'Stand with the bar at the thighs, soften but mostly fix the knees, brace, and push the hips back as the bar tracks close to the legs. Stop before spinal position changes, drive the hips forward, and stand tall.',
    commonMistakes:
      'Locking the knees, rounding the back, reaching the bar forward, descending beyond hamstring range, or hyperextending at the top.',
    imageAltText: 'Athlete performing a stiff-leg barbell deadlift',
    classification: [
      'hip-hinge',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['barbell', 'weight-plates'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['erector-spinae', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 2],
      ['forearm-flexors', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 4, 2, 3, 3, 5, 5, 2],
    demandScores: [4, 2, 4, 4, 5, 4, 4, 4],
  }),
  createExercise({
    name: 'Good Morning',
    slug: 'good-morning',
    description:
      'A barbell hip hinge with the load across the upper back that develops hamstring, glute, and spinal-bracing strength.',
    instructions:
      'Set the bar securely across the upper back, soften the knees, and brace. Push the hips backward while maintaining a neutral spine, stop at the available hamstring range, and extend the hips to stand.',
    commonMistakes:
      'Rounding the spine, turning it into a squat, placing the bar on the neck, descending too far, or losing abdominal pressure.',
    imageAltText: 'Athlete performing a barbell good morning',
    classification: [
      'hip-hinge',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'squat-rack'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['erector-spinae', MuscleRole.SECONDARY, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [4, 3, 2, 3, 4, 4, 5, 2],
    demandScores: [4, 3, 5, 4, 4, 4, 2, 5],
  }),
  createExercise({
    name: 'Seated Leg Curl',
    slug: 'seated-leg-curl',
    description:
      'A seated machine knee-flexion exercise that trains the hamstrings from a lengthened hip-flexed position.',
    instructions:
      'Align the knees with the machine pivot, secure the thigh pad, and begin with legs extended. Curl the pad beneath the seat without lifting the hips, pause, and return slowly to full knee extension.',
    commonMistakes:
      'Lifting the hips, arching the back, using momentum, shortening extension, or letting the stack crash.',
    imageAltText: 'Athlete using a seated leg curl machine',
    classification: [
      'knee-flexion-pattern',
      ForceType.PULL,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['leg-curl-machine'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 2, 1, 5, 1, 4, 5, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Lying Leg Curl',
    slug: 'lying-leg-curl',
    description:
      'A prone machine curl that isolates knee flexion for direct hamstring training.',
    instructions:
      'Lie prone with knees aligned to the pivot and the pad above the heels. Brace the pelvis into the bench, curl toward the glutes, pause, and lower slowly to straight legs.',
    commonMistakes:
      'Lifting the hips, arching the lower back, bouncing, shortening the eccentric, or placing the pad on the calves incorrectly.',
    imageAltText: 'Athlete using a lying leg curl machine',
    classification: [
      'knee-flexion-pattern',
      ForceType.PULL,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.PRONE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['leg-curl-machine'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 3],
    ],
    capabilityScores: [5, 2, 1, 5, 1, 4, 4, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Nordic Hamstring Curl',
    slug: 'nordic-hamstring-curl',
    description:
      'An assisted bodyweight knee-flexion exercise that exposes the hamstrings to very high eccentric force.',
    instructions:
      'Kneel on padding with the ankles securely anchored and hips extended. Lower the body from the knees as slowly as possible while maintaining a straight line, use the hands as needed, and pull back toward upright under control.',
    commonMistakes:
      'Bending at the hips, losing trunk alignment, dropping without control, using no assistance when needed, or forcing painful range.',
    imageAltText: 'Athlete performing an assisted Nordic hamstring curl',
    classification: [
      'knee-flexion-pattern',
      ForceType.PULL,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.KNEELING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 2],
      ['gluteus-maximus', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 3, 2, 3, 4, 2, 5, 3],
    demandScores: [4, 2, 4, 2, 5, 5, 0, 0],
  }),
  createExercise({
    name: 'Glute-ham Raise',
    slug: 'glute-ham-raise',
    description:
      'A bodyweight posterior-chain exercise combining controlled knee flexion and hip extension on a back-extension station.',
    instructions:
      'Secure the feet and position the knees behind the pad. Begin with the body extended, lower under control by opening the knees and hips, then contract the hamstrings and glutes to return without folding at the waist.',
    commonMistakes:
      'Losing hip extension, using momentum, hyperextending the back, setting the pad incorrectly, or shortening the lowering range.',
    imageAltText: 'Athlete performing a glute-ham raise',
    classification: [
      'knee-flexion-pattern',
      ForceType.PULL,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.OTHER,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['bodyweight', 'back-extension-bench'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 4],
      ['erector-spinae', MuscleRole.SECONDARY, 3],
      ['gastrocnemius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 3, 2, 4, 4, 3, 5, 4],
    demandScores: [4, 3, 4, 3, 5, 4, 0, 1],
  }),
  createExercise({
    name: 'Single-leg Romanian Deadlift',
    slug: 'single-leg-romanian-deadlift',
    description:
      'A unilateral hinge that trains the hamstrings and glutes while demanding pelvic, foot, and trunk stability.',
    instructions:
      'Stand on one leg with a soft knee, brace, and reach the free leg backward as the torso hinges forward. Keep the hips square, stop before losing balance or spinal position, and drive the stance hip forward to stand.',
    commonMistakes:
      'Opening the hips, rounding, reaching the weight away, bending the stance knee excessively, or pushing off the free foot.',
    imageAltText:
      'Athlete performing a single-leg Romanian deadlift with dumbbells',
    classification: [
      'hip-hinge',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['hamstrings', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 5],
      ['hip-adductors', MuscleRole.STABILIZER, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 2, 2, 4, 5, 3, 5, 3],
    demandScores: [4, 1, 5, 3, 5, 3, 3, 2],
  }),
];
