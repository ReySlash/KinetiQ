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

export const quadricepsExercises: ExerciseSeed[] = [
  {
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    description:
      'A compound lower-body exercise performed with a barbell positioned across the upper back.',
    instructions:
      'Position the bar securely across the upper back, establish a stable stance, brace the trunk, and descend by flexing the hips and knees. Keep the feet planted and knees tracking in line with the toes. Reverse the movement by driving through the floor while maintaining torso control.',
    commonMistakes:
      'Losing trunk tension, allowing the heels to rise, knees collapsing inward, descending beyond the available controlled range, or allowing the bar to move excessively forward of the midfoot.',
    movementPatternSlug: 'squat',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.CLOSED,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing a barbell back squat',
    equipmentSlugs: ['barbell', 'squat-rack'],
    muscles: [
      {
        muscleSlug: 'quadriceps',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'gluteus-maximus',
        role: MuscleRole.PRIMARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'hip-adductors',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'hamstrings',
        role: MuscleRole.SECONDARY,
        involvementScore: 2,
      },
      {
        muscleSlug: 'erector-spinae',
        role: MuscleRole.STABILIZER,
        involvementScore: 4,
      },
      {
        muscleSlug: 'transverse-abdominis',
        role: MuscleRole.STABILIZER,
        involvementScore: 4,
      },
      {
        muscleSlug: 'gluteus-medius',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
    ],
    capabilities: {
      hypertrophyPotential: 5,
      maximalStrengthPotential: 5,
      powerDevelopmentPotential: 4,
      muscularEndurancePotential: 3,
      stabilityDevelopmentPotential: 4,
      typicalLoadability: 5,
      stretchPositionLoading: 4,
      shortenedPositionLoading: 3,
    },
    demands: {
      technicalDemand: 4,
      setupComplexity: 3,
      stabilityDemand: 4,
      systemicFatiguePotential: 5,
      localFatiguePotential: 5,
      recoveryCostPotential: 5,
      gripDemand: 1,
      axialLoadingPotential: 5,
    },
  },
  {
    name: 'Bulgarian Split Squat',
    slug: 'bulgarian-split-squat',
    description:
      'A unilateral split-squat variation performed with the rear foot elevated.',
    instructions:
      'Place the rear foot on a bench and position the front foot far enough forward to maintain balance. Descend by bending the front knee and hip while keeping the front foot planted. Drive through the front leg to return to the starting position.',
    commonMistakes:
      'Placing the front foot too close to the bench, pushing excessively from the rear leg, allowing the front knee to collapse inward, losing pelvic control, or rushing repetitions.',
    movementPatternSlug: 'lunge',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.CLOSED,
    isCompound: true,
    laterality: Laterality.UNILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing a Bulgarian split squat',
    equipmentSlugs: ['bodyweight', 'bench'],
    muscles: [
      {
        muscleSlug: 'quadriceps',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'gluteus-maximus',
        role: MuscleRole.PRIMARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'gluteus-medius',
        role: MuscleRole.STABILIZER,
        involvementScore: 5,
      },
      {
        muscleSlug: 'hip-adductors',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'hamstrings',
        role: MuscleRole.SECONDARY,
        involvementScore: 2,
      },
      {
        muscleSlug: 'transverse-abdominis',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
    ],
    capabilities: {
      hypertrophyPotential: 5,
      maximalStrengthPotential: 3,
      powerDevelopmentPotential: 3,
      muscularEndurancePotential: 4,
      stabilityDevelopmentPotential: 5,
      typicalLoadability: 3,
      stretchPositionLoading: 5,
      shortenedPositionLoading: 3,
    },
    demands: {
      technicalDemand: 4,
      setupComplexity: 3,
      stabilityDemand: 5,
      systemicFatiguePotential: 3,
      localFatiguePotential: 5,
      recoveryCostPotential: 4,
      gripDemand: 0,
      axialLoadingPotential: 1,
    },
  },
  createExercise({
    name: 'Barbell Front Squat',
    slug: 'barbell-front-squat',
    description:
      'A front-loaded squat that emphasizes the quadriceps and upright trunk while developing braced lower-body strength.',
    instructions:
      'Rack the bar across the front shoulders, lift the elbows, brace, and squat between the hips with knees tracking over the feet. Keep the chest tall, reach controlled depth, and drive through the floor to stand.',
    commonMistakes:
      'Dropping the elbows, rounding the upper back, letting the knees cave, shifting onto the toes, or losing brace at the bottom.',
    imageAltText: 'Athlete performing a barbell front squat',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['barbell', 'weight-plates', 'squat-rack'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [5, 5, 3, 3, 4, 5, 5, 3],
    demandScores: [4, 4, 4, 5, 5, 5, 2, 5],
  }),
  createExercise({
    name: 'High-bar Back Squat',
    slug: 'high-bar-back-squat',
    description:
      'A back squat with the bar high on the trapezius that favors an upright, knee-dominant pattern for quadriceps development.',
    instructions:
      'Set the bar high across the upper back, brace, and descend by bending knees and hips together. Keep the whole foot planted and knees tracking over toes, then drive upward while maintaining torso position.',
    commonMistakes:
      'Letting the knees collapse, lifting the heels, losing spinal position, descending without control, or allowing the hips to shoot up first.',
    imageAltText: 'Athlete performing a high-bar back squat',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['barbell', 'weight-plates', 'squat-rack'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [5, 5, 3, 3, 4, 5, 5, 3],
    demandScores: [4, 4, 4, 5, 5, 5, 2, 5],
  }),
  createExercise({
    name: 'Goblet Squat',
    slug: 'goblet-squat',
    description:
      'A front-held squat using one dumbbell or kettlebell to teach controlled depth and train the quadriceps and glutes.',
    instructions:
      'Hold the weight close to the chest, set the feet, and brace. Sit between the hips while the knees track over the toes, keep the torso tall, and press through the whole foot to stand.',
    commonMistakes:
      'Holding the weight away from the body, collapsing the knees inward, lifting the heels, rounding, or rushing out of the bottom.',
    imageAltText: 'Athlete performing a goblet squat',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 5, 3, 3, 5, 3],
    demandScores: [2, 1, 3, 3, 5, 2, 2, 2],
  }),
  createExercise({
    name: 'Hack Squat',
    slug: 'hack-squat',
    description:
      'A guided machine squat that provides stable, high local loading to the quadriceps and glutes.',
    instructions:
      'Position the shoulders under the pads and place the feet securely on the platform. Release the stops, lower with the back supported and knees tracking over toes, then press the platform away without locking aggressively.',
    commonMistakes:
      'Placing the feet too low for comfort, letting the knees cave, bouncing at depth, lifting the hips from the pad, or locking the knees forcefully.',
    imageAltText: 'Athlete using a hack squat machine',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['hack-squat-machine'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 2, 4, 1, 5, 5, 4],
    demandScores: [2, 2, 1, 3, 5, 4, 0, 3],
  }),
  createExercise({
    name: 'Leg Press',
    slug: 'leg-press',
    description:
      'A supported machine press that loads knee and hip extension with high progression potential and low balance demand.',
    instructions:
      'Set the seat for a comfortable depth, place the feet evenly, and brace the pelvis against the pad. Lower the platform until control or hip range ends, then press through the whole foot without locking the knees.',
    commonMistakes:
      'Allowing the pelvis to roll off the pad, letting the knees cave, using a shallow range, locking the knees, or placing the feet unevenly.',
    imageAltText: 'Athlete using a leg press machine',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['leg-press-machine'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 2, 4, 1, 5, 5, 4],
    demandScores: [1, 2, 1, 3, 5, 3, 0, 2],
  }),
  createExercise({
    name: 'Reverse Lunge',
    slug: 'reverse-lunge',
    description:
      'A backward-stepping lunge that trains unilateral knee and hip extension with controllable forward-knee demand.',
    instructions:
      'Stand tall and step one foot backward onto the ball of the foot. Lower both knees while keeping the front foot planted, drive through the front leg to return, and alternate or complete one side.',
    commonMistakes:
      'Stepping too narrowly, collapsing the front knee, pushing mainly from the rear foot, losing balance, or shortening depth.',
    imageAltText: 'Athlete performing a reverse lunge',
    classification: [
      'lunge',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 5, 5, 3, 4, 3],
    demandScores: [2, 0, 5, 3, 5, 3, 0, 2],
  }),
  createExercise({
    name: 'Walking Lunge',
    slug: 'walking-lunge',
    description:
      'A traveling alternating lunge that develops unilateral leg strength, coordination, and pelvic control.',
    instructions:
      'Stand tall, step forward far enough to keep the front foot planted, and lower both knees under control. Drive through the lead leg, bring the body forward into the next step, and keep the pelvis level.',
    commonMistakes:
      'Taking steps that are too short, letting the knees collapse, bouncing the rear knee, leaning excessively, or losing foot pressure.',
    imageAltText: 'Athlete performing walking lunges',
    classification: [
      'lunge',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 5, 5, 3, 4, 3],
    demandScores: [3, 0, 5, 4, 5, 3, 0, 2],
  }),
  createExercise({
    name: 'Leg Extension',
    slug: 'leg-extension',
    description:
      'A seated open-chain knee-extension exercise that isolates the quadriceps through a controlled arc.',
    instructions:
      'Align the machine pivot with the knee, place the pad above the ankles, and sit firmly against the backrest. Extend the knees smoothly, pause without snapping them straight, and lower under control to the start.',
    commonMistakes:
      'Using momentum, lifting the hips, misaligning the knee with the pivot, locking aggressively, or letting the stack crash.',
    imageAltText: 'Athlete using a seated leg extension machine',
    classification: [
      'squat',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['leg-extension-machine'],
    muscles: [['quadriceps', MuscleRole.PRIMARY, 5]],
    capabilityScores: [5, 2, 1, 5, 1, 4, 4, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 0],
  }),
];
