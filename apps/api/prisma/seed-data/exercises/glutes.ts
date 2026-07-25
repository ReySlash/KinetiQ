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

export const glutesExercises: ExerciseSeed[] = [
  {
    name: 'Barbell Hip Thrust',
    slug: 'barbell-hip-thrust',
    description:
      'A loaded hip-extension exercise performed with the upper back supported on a bench.',
    instructions:
      'Sit with the upper back against a bench and position the padded bar across the hips. Plant the feet, brace the trunk, and drive through the floor to extend the hips. Finish with the torso and thighs approximately aligned while avoiding excessive lumbar extension.',
    commonMistakes:
      'Hyperextending the lower back, placing the feet too far forward or backward, pushing through the toes, losing control at the bottom, or failing to reach full hip extension.',
    movementPatternSlug: 'hip-extension-pattern',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.CLOSED,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.SITTING,
    skillLevel: SkillLevel.BEGINNER,
    imageAltText: 'Athlete performing a barbell hip thrust against a bench',
    equipmentSlugs: ['barbell', 'bench'],
    muscles: [
      {
        muscleSlug: 'gluteus-maximus',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'hamstrings',
        role: MuscleRole.SECONDARY,
        involvementScore: 2,
      },
      {
        muscleSlug: 'adductor-magnus',
        role: MuscleRole.SECONDARY,
        involvementScore: 2,
      },
      {
        muscleSlug: 'gluteus-medius',
        role: MuscleRole.STABILIZER,
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
      maximalStrengthPotential: 4,
      powerDevelopmentPotential: 3,
      muscularEndurancePotential: 3,
      stabilityDevelopmentPotential: 2,
      typicalLoadability: 5,
      stretchPositionLoading: 2,
      shortenedPositionLoading: 5,
    },
    demands: {
      technicalDemand: 2,
      setupComplexity: 4,
      stabilityDemand: 2,
      systemicFatiguePotential: 2,
      localFatiguePotential: 5,
      recoveryCostPotential: 3,
      gripDemand: 0,
      axialLoadingPotential: 1,
    },
  },
  createExercise({
    name: 'Barbell Glute Bridge',
    slug: 'barbell-glute-bridge',
    description:
      'A floor-based loaded hip extension that trains the gluteus maximus with a shorter range than a bench-supported thrust.',
    instructions:
      'Lie with knees bent and a padded bar over the hips. Brace the ribs down, drive through the feet to extend the hips, squeeze without arching, and lower the pelvis under control.',
    commonMistakes:
      'Hyperextending the back, pushing through the toes, placing the feet too far away, letting the knees collapse, or bouncing from the floor.',
    imageAltText: 'Athlete performing a barbell glute bridge',
    classification: [
      'hip-extension-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['barbell', 'weight-plates'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['hamstrings', MuscleRole.SECONDARY, 3],
      ['hip-adductors', MuscleRole.SECONDARY, 2],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 3, 2, 4, 2, 5, 2, 5],
    demandScores: [2, 2, 2, 2, 5, 3, 1, 1],
  }),
  createExercise({
    name: 'Cable Pull-through',
    slug: 'cable-pull-through',
    description:
      'A cable hinge that loads hip extension while keeping resistance behind the body and axial loading low.',
    instructions:
      'Face away from a low pulley with the rope between the legs. Step forward, brace, push the hips back while keeping the shins mostly vertical, then drive the hips forward and return under control.',
    commonMistakes:
      'Squatting instead of hinging, rounding, pulling with the arms, hyperextending at lockout, or standing too close to the stack.',
    imageAltText: 'Athlete performing a cable pull-through',
    classification: [
      'hip-hinge',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['hamstrings', MuscleRole.SECONDARY, 4],
      ['erector-spinae', MuscleRole.STABILIZER, 2],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 4, 3, 3, 5, 4],
    demandScores: [2, 2, 3, 2, 4, 2, 2, 1],
  }),
  createExercise({
    name: 'Step-up',
    slug: 'step-up',
    description:
      'A unilateral ascent onto a box that develops quadriceps and glute strength with meaningful pelvic control.',
    instructions:
      'Place the whole working foot on a stable box, lean slightly forward, and brace. Drive through the elevated leg to stand on the box, control the pelvis, and lower slowly without dropping.',
    commonMistakes:
      'Pushing hard from the trailing leg, using a box that is too high, letting the knee collapse, placing only the toes on the box, or dropping down.',
    imageAltText: 'Athlete performing a dumbbell step-up onto a box',
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
    equipmentSlugs: ['dumbbells', 'plyometric-box'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['quadriceps', MuscleRole.PRIMARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['hip-adductors', MuscleRole.STABILIZER, 3],
      ['gastrocnemius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [4, 3, 3, 4, 5, 4, 4, 3],
    demandScores: [3, 2, 5, 3, 5, 3, 3, 2],
  }),
  createExercise({
    name: 'Deficit Reverse Lunge',
    slug: 'deficit-reverse-lunge',
    description:
      'A reverse lunge from a raised platform that increases hip and knee range for glute-focused unilateral loading.',
    instructions:
      'Stand securely on a low box with dumbbells at the sides. Step one foot back to the floor, lower the lead hip under control while keeping the front foot planted, then drive through the elevated leg to return.',
    commonMistakes:
      'Using an excessive deficit, pushing from the rear foot, collapsing the front knee, losing balance, or allowing the front heel to lift.',
    imageAltText: 'Athlete performing a deficit reverse lunge with dumbbells',
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
    equipmentSlugs: ['dumbbells', 'plyometric-box'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['quadriceps', MuscleRole.PRIMARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['hip-adductors', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 3, 2, 4, 5, 4, 5, 3],
    demandScores: [3, 2, 5, 4, 5, 4, 3, 2],
  }),
  createExercise({
    name: 'Cable Glute Kickback',
    slug: 'cable-glute-kickback',
    description:
      'A unilateral cable hip-extension exercise that isolates the gluteus maximus near its shortened position.',
    instructions:
      'Attach an ankle cuff to a low pulley and hold the machine for balance. Keep the pelvis square and knee softly bent, extend the hip without arching, pause behind the body, and return slowly.',
    commonMistakes:
      'Hyperextending the back, rotating the pelvis, swinging the leg, bending the knee repeatedly, or using too much range.',
    imageAltText: 'Athlete performing a cable glute kickback',
    classification: [
      'hip-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
      ['hamstrings', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [4, 1, 1, 5, 3, 2, 2, 5],
    demandScores: [2, 2, 3, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Machine Hip Abduction',
    slug: 'machine-hip-abduction',
    description:
      'A seated machine exercise that directly loads the lateral glutes through hip abduction.',
    instructions:
      'Set the pads outside the knees and sit with the pelvis stable. Press the thighs outward without rocking, pause at a controlled end range, and return slowly against the machine.',
    commonMistakes:
      'Bouncing, leaning excessively, rotating the feet to chase range, allowing the stack to crash, or lifting the pelvis.',
    imageAltText: 'Athlete using a seated hip abduction machine',
    classification: [
      'hip-abduction-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['hip-abduction-machine'],
    muscles: [
      ['gluteus-medius', MuscleRole.PRIMARY, 5],
      ['gluteus-minimus', MuscleRole.PRIMARY, 4],
    ],
    capabilityScores: [5, 1, 1, 5, 1, 4, 3, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Cable Hip Abduction',
    slug: 'cable-hip-abduction',
    description:
      'A standing unilateral hip-abduction exercise that trains the lateral glutes and stance-leg pelvic stability.',
    instructions:
      'Attach a cuff to the outside leg and stand side-on to a low pulley. Brace and keep the pelvis level as the leg moves outward, pause without leaning, and return slowly across the body.',
    commonMistakes:
      'Leaning away, rotating the toes, hiking the pelvis, swinging, or shifting all tension into the support arm.',
    imageAltText: 'Athlete performing standing cable hip abduction',
    classification: [
      'hip-abduction-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['gluteus-medius', MuscleRole.PRIMARY, 5],
      ['gluteus-minimus', MuscleRole.PRIMARY, 4],
      ['gluteus-maximus', MuscleRole.STABILIZER, 2],
      ['external-obliques', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 1, 1, 5, 5, 2, 4, 5],
    demandScores: [2, 2, 5, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Frog Pump',
    slug: 'frog-pump',
    description:
      'A high-repetition bodyweight hip-extension exercise performed with the soles together to emphasize shortened glute contraction.',
    instructions:
      'Lie supine, bring the soles of the feet together, and let the knees open comfortably. Brace the ribs down, drive the hips upward by squeezing the glutes, pause, and lower under control.',
    commonMistakes:
      'Arching the lower back, forcing the knees down, bouncing, pushing through the feet instead of extending the hips, or rushing repetitions.',
    imageAltText: 'Athlete performing bodyweight frog pumps',
    classification: [
      'hip-extension-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['gluteus-medius', MuscleRole.SECONDARY, 2],
      ['transverse-abdominis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [3, 1, 1, 5, 1, 1, 1, 5],
    demandScores: [1, 0, 1, 1, 5, 1, 0, 0],
  }),
  createExercise({
    name: 'Single-leg Hip Thrust',
    slug: 'single-leg-hip-thrust',
    description:
      'A unilateral bench-supported hip extension that develops glute strength and pelvic control without heavy external loading.',
    instructions:
      'Place the upper back on a bench, plant one foot, and lift the other leg. Brace the ribs down, drive the stance hip upward while keeping the pelvis level, pause, and lower slowly.',
    commonMistakes:
      'Rotating the pelvis, hyperextending the back, pushing through the toes, placing the foot poorly, or using momentum.',
    imageAltText: 'Athlete performing a single-leg hip thrust',
    classification: [
      'hip-extension-pattern',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight', 'bench'],
    muscles: [
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['hamstrings', MuscleRole.SECONDARY, 3],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 2, 2, 4, 5, 3, 3, 5],
    demandScores: [3, 1, 5, 2, 5, 3, 0, 1],
  }),
];
