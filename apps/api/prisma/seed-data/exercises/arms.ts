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

export const armsExercises: ExerciseSeed[] = [
  {
    name: 'Barbell Biceps Curl',
    slug: 'barbell-biceps-curl',
    description: 'A bilateral elbow-flexion exercise performed with a barbell.',
    instructions:
      'Stand upright holding the bar with a supinated grip. Keep the upper arms near the torso and flex the elbows to raise the bar. Squeeze the elbow flexors near the top and lower the bar under control without allowing the shoulders or hips to create momentum.',
    commonMistakes:
      'Swinging the torso, driving the elbows forward excessively, extending the wrists, using an incomplete range of motion, or lowering the bar without control.',
    movementPatternSlug: 'elbow-flexion-pattern',
    forceType: ForceType.PULL,
    kineticChain: KineticChain.OPEN,
    isCompound: false,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.BEGINNER,
    imageAltText: 'Athlete performing a standing barbell biceps curl',
    equipmentSlugs: ['barbell'],
    muscles: [
      {
        muscleSlug: 'biceps-brachii',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'brachialis',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'brachioradialis',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'forearm-flexors',
        role: MuscleRole.STABILIZER,
        involvementScore: 2,
      },
    ],
    capabilities: {
      hypertrophyPotential: 4,
      maximalStrengthPotential: 2,
      powerDevelopmentPotential: 1,
      muscularEndurancePotential: 4,
      stabilityDevelopmentPotential: 1,
      typicalLoadability: 3,
      stretchPositionLoading: 3,
      shortenedPositionLoading: 4,
    },
    demands: {
      technicalDemand: 1,
      setupComplexity: 1,
      stabilityDemand: 1,
      systemicFatiguePotential: 1,
      localFatiguePotential: 4,
      recoveryCostPotential: 2,
      gripDemand: 2,
      axialLoadingPotential: 0,
    },
  },
  {
    name: 'Cable Triceps Pushdown',
    slug: 'cable-triceps-pushdown',
    description:
      'An elbow-extension isolation exercise performed using a high cable attachment.',
    instructions:
      'Stand facing the cable with the upper arms held near the torso. Begin with the elbows flexed and extend them to push the attachment downward. Keep the shoulders stable and return under control without allowing the elbows to move significantly forward.',
    commonMistakes:
      'Leaning bodyweight onto the attachment, allowing the elbows to flare or drift forward, using shoulder extension to complete the repetition, or shortening the eccentric phase.',
    movementPatternSlug: 'elbow-extension-pattern',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.OPEN,
    isCompound: false,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.BEGINNER,
    imageAltText: 'Athlete performing a cable triceps pushdown',
    equipmentSlugs: ['cable-machine'],
    muscles: [
      {
        muscleSlug: 'triceps-brachii',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'forearm-flexors',
        role: MuscleRole.STABILIZER,
        involvementScore: 2,
      },
      {
        muscleSlug: 'anterior-deltoid',
        role: MuscleRole.STABILIZER,
        involvementScore: 1,
      },
    ],
    capabilities: {
      hypertrophyPotential: 4,
      maximalStrengthPotential: 2,
      powerDevelopmentPotential: 1,
      muscularEndurancePotential: 4,
      stabilityDevelopmentPotential: 1,
      typicalLoadability: 3,
      stretchPositionLoading: 2,
      shortenedPositionLoading: 5,
    },
    demands: {
      technicalDemand: 1,
      setupComplexity: 1,
      stabilityDemand: 1,
      systemicFatiguePotential: 1,
      localFatiguePotential: 4,
      recoveryCostPotential: 2,
      gripDemand: 1,
      axialLoadingPotential: 0,
    },
  },
  createExercise({
    name: 'EZ-bar Curl',
    slug: 'ez-bar-curl',
    description:
      'An angled-bar curl that loads the elbow flexors while allowing a comfortable semi-supinated wrist position.',
    instructions:
      'Stand tall with the EZ bar at arm’s length. Keep the upper arms near the torso, curl without leaning, squeeze near the top, and lower to full controlled elbow extension.',
    commonMistakes:
      'Swinging the hips, moving the elbows forward, extending the wrists, shortening the bottom range, or dropping the bar quickly.',
    imageAltText: 'Athlete performing an EZ-bar biceps curl',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['ez-bar'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 4],
      ['brachioradialis', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 1, 4, 1, 3, 3, 4],
    demandScores: [1, 1, 1, 1, 4, 2, 2, 0],
  }),
  createExercise({
    name: 'Alternating Dumbbell Curl',
    slug: 'alternating-dumbbell-curl',
    description:
      'A standing curl that trains each elbow flexor independently while alternating repetitions between arms.',
    instructions:
      'Stand with dumbbells by the sides and palms neutral. Curl one weight while supinating the forearm, keep the shoulder quiet, lower fully, and repeat with the other arm.',
    commonMistakes:
      'Rotating the torso, swinging, curling both arms unintentionally, moving the elbows forward, or failing to control the lowering phase.',
    imageAltText: 'Athlete performing alternating dumbbell curls',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 4],
      ['brachioradialis', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 1, 5, 2, 3, 3, 4],
    demandScores: [2, 1, 2, 1, 4, 2, 2, 0],
  }),
  createExercise({
    name: 'Incline Dumbbell Curl',
    slug: 'incline-dumbbell-curl',
    description:
      'A seated curl with the arms behind the torso that loads the biceps strongly in a lengthened shoulder position.',
    instructions:
      'Set a moderate incline and sit with the arms hanging vertically. Keep the shoulders back, curl without moving the upper arms, and lower slowly until the elbows are fully extended.',
    commonMistakes:
      'Letting the shoulders roll forward, swinging, lifting the elbows, using too steep a bench, or stopping short of the bottom.',
    imageAltText: 'Athlete performing incline dumbbell curls',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells', 'adjustable-bench'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 1, 2, 5, 3],
    demandScores: [2, 2, 1, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'Hammer Curl',
    slug: 'hammer-curl',
    description:
      'A neutral-grip dumbbell curl that emphasizes the brachialis and brachioradialis while training elbow flexion.',
    instructions:
      'Stand with palms facing the thighs and shoulders set. Curl the dumbbells without rotating the forearms, keep the elbows close, and lower under control to straight arms.',
    commonMistakes:
      'Swinging, bending the wrists, drifting the elbows forward, shrugging, or shortening the range.',
    imageAltText: 'Athlete performing dumbbell hammer curls',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['brachialis', MuscleRole.PRIMARY, 5],
      ['brachioradialis', MuscleRole.PRIMARY, 4],
      ['biceps-brachii', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 1, 5, 1, 3, 3, 4],
    demandScores: [1, 1, 1, 1, 4, 2, 3, 0],
  }),
  createExercise({
    name: 'Preacher Curl',
    slug: 'preacher-curl',
    description:
      'A supported curl that fixes the upper arms against a pad for strict elbow-flexor loading.',
    instructions:
      'Adjust the seat so the armpits rest near the top of the pad, hold the EZ bar, and begin with nearly straight elbows. Curl without lifting the arms, pause, and lower slowly without relaxing into the joint.',
    commonMistakes:
      'Bouncing from the bottom, lifting the elbows, cutting extension short, extending the wrists, or using a load that strains the elbows.',
    imageAltText: 'Athlete performing an EZ-bar preacher curl',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['ez-bar', 'adjustable-bench'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 4],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 2, 1, 4, 1, 3, 5, 4],
    demandScores: [1, 2, 1, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'Cable Curl',
    slug: 'cable-curl',
    description:
      'A standing cable curl that maintains elbow-flexor tension through the full repetition.',
    instructions:
      'Face a low pulley with arms extended and elbows beside the torso. Curl the handle without leaning, squeeze at the top, and return slowly until the elbows straighten.',
    commonMistakes:
      'Leaning back, allowing the elbows to travel, bending the wrists, using momentum, or letting the stack crash.',
    imageAltText: 'Athlete performing a standing cable curl',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 4],
      ['brachioradialis', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 1, 1, 5, 1, 3, 3, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'Bayesian Cable Curl',
    slug: 'bayesian-cable-curl',
    description:
      'A cable curl performed with the working arm behind the torso to emphasize lengthened-position biceps loading.',
    instructions:
      'Stand ahead of a low pulley with the handle held behind the hip. Keep the shoulder extended and upper arm still, curl through the elbow, then lower slowly to a full controlled stretch.',
    commonMistakes:
      'Rotating toward the cable, letting the elbow move forward, shrugging, arching the back, or rushing the lengthened position.',
    imageAltText: 'Athlete performing a single-arm Bayesian cable curl',
    classification: [
      'elbow-flexion-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['biceps-brachii', MuscleRole.PRIMARY, 5],
      ['brachialis', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 2, 2, 5, 4],
    demandScores: [2, 2, 2, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Close-grip Bench Press',
    slug: 'close-grip-bench-press',
    description:
      'A barbell press with a moderate narrow grip that emphasizes triceps strength while retaining chest contribution.',
    instructions:
      'Lie with feet planted and shoulder blades retracted, then grip the bar around shoulder width. Lower toward the lower chest with elbows controlled, press to full elbow extension, and keep the wrists stacked.',
    commonMistakes:
      'Using an excessively narrow grip, flaring the elbows, bouncing the bar, losing scapular tension, or allowing the wrists to fold back.',
    imageAltText: 'Athlete performing a close-grip barbell bench press',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['barbell', 'bench', 'squat-rack'],
    muscles: [
      ['triceps-brachii', MuscleRole.PRIMARY, 5],
      ['pectoralis-major', MuscleRole.SECONDARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 5, 3, 3, 2, 5, 4, 4],
    demandScores: [3, 3, 3, 3, 5, 3, 2, 0],
  }),
  createExercise({
    name: 'Lying Barbell Triceps Extension',
    slug: 'lying-barbell-triceps-extension',
    description:
      'A supine elbow-extension exercise that loads the triceps through a long range with the upper arms inclined.',
    instructions:
      'Lie on a bench holding an EZ bar above the shoulders. Keep the upper arms stable, bend the elbows to lower behind the forehead, then extend smoothly and return the bar above the shoulders.',
    commonMistakes:
      'Flaring the elbows, moving the shoulders excessively, lowering toward the face, arching the back, or dropping into the bottom.',
    imageAltText: 'Athlete performing a lying EZ-bar triceps extension',
    classification: [
      'elbow-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['ez-bar', 'bench'],
    muscles: [
      ['long-head-triceps-brachii', MuscleRole.PRIMARY, 5],
      ['lateral-head-triceps-brachii', MuscleRole.SECONDARY, 4],
      ['medial-head-triceps-brachii', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 2, 1, 4, 2, 3, 5, 4],
    demandScores: [3, 2, 2, 1, 5, 3, 2, 0],
  }),
  createExercise({
    name: 'Rope Triceps Pushdown',
    slug: 'rope-triceps-pushdown',
    description:
      'A rope pushdown that trains elbow extension and permits the hands to separate at lockout.',
    instructions:
      'Face a high cable with elbows close to the torso and hold the rope neutrally. Extend the elbows, separate the rope near the thighs, pause, and return under control without moving the upper arms.',
    commonMistakes:
      'Leaning onto the rope, flaring the elbows, using shoulder extension, bending the wrists, or shortening the return.',
    imageAltText: 'Athlete performing a rope triceps pushdown',
    classification: [
      'elbow-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['triceps-brachii', MuscleRole.PRIMARY, 5],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 1, 5, 1, 3, 2, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Overhead Cable Triceps Extension',
    slug: 'overhead-cable-triceps-extension',
    description:
      'An overhead cable extension that places the long head of the triceps under substantial lengthened tension.',
    instructions:
      'Face away from a high cable with the rope behind the head and elbows pointed forward. Brace the trunk, extend the elbows overhead, and return slowly while keeping the upper arms still.',
    commonMistakes:
      'Flaring the elbows, arching the lower back, moving the shoulders, using momentum, or shortening elbow flexion.',
    imageAltText: 'Athlete performing an overhead cable triceps extension',
    classification: [
      'elbow-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['long-head-triceps-brachii', MuscleRole.PRIMARY, 5],
      ['lateral-head-triceps-brachii', MuscleRole.SECONDARY, 3],
      ['medial-head-triceps-brachii', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 2, 3, 5, 4],
    demandScores: [2, 2, 2, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Dumbbell Overhead Triceps Extension',
    slug: 'dumbbell-overhead-triceps-extension',
    description:
      'A seated overhead extension using one dumbbell to train the triceps through a deep elbow-flexion range.',
    instructions:
      'Sit tall and hold one dumbbell overhead with both hands. Keep the ribs down and upper arms near the head, lower behind the head by bending the elbows, then extend without moving the shoulders.',
    commonMistakes:
      'Arching the back, flaring the elbows, lowering too quickly, losing grip security, or turning the movement into a press.',
    imageAltText:
      'Athlete performing a seated dumbbell overhead triceps extension',
    classification: [
      'elbow-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells', 'bench'],
    muscles: [
      ['long-head-triceps-brachii', MuscleRole.PRIMARY, 5],
      ['lateral-head-triceps-brachii', MuscleRole.SECONDARY, 3],
      ['medial-head-triceps-brachii', MuscleRole.SECONDARY, 3],
    ],
    capabilityScores: [5, 1, 1, 4, 2, 3, 5, 4],
    demandScores: [2, 2, 2, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'JM Press',
    slug: 'jm-press',
    description:
      'A hybrid close-grip press and triceps extension that permits heavy triceps loading with a short bar path toward the upper chest.',
    instructions:
      'Lie on a bench with a shoulder-width grip. Lower the bar toward the upper chest by bending the elbows forward while keeping them above the torso, then extend the elbows to press back up.',
    commonMistakes:
      'Lowering like a standard bench press, dropping toward the face, flaring the elbows, using excessive load, or losing wrist alignment.',
    imageAltText: 'Athlete performing a JM press with a barbell',
    classification: [
      'elbow-extension-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'bench', 'squat-rack'],
    muscles: [
      ['triceps-brachii', MuscleRole.PRIMARY, 5],
      ['pectoralis-major', MuscleRole.SECONDARY, 2],
      ['anterior-deltoid', MuscleRole.SECONDARY, 2],
      ['forearm-flexors', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 2, 3, 2, 5, 4, 4],
    demandScores: [4, 3, 3, 2, 5, 3, 2, 0],
  }),
  createExercise({
    name: 'Diamond Push-up',
    slug: 'diamond-push-up',
    description:
      'A narrow-hand push-up that increases elbow-extension demand while retaining chest and trunk involvement.',
    instructions:
      'Form a rigid plank and place the hands close beneath the chest. Lower with elbows tracking back, keep the trunk braced, press to full support, and allow the shoulder blades to move naturally at the top.',
    commonMistakes:
      'Placing the hands uncomfortably narrow, flaring the elbows, sagging the hips, shortening depth, or craning the neck.',
    imageAltText: 'Athlete performing a diamond push-up',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.PRONE,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['triceps-brachii', MuscleRole.PRIMARY, 5],
      ['pectoralis-major', MuscleRole.SECONDARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 5, 4, 2, 4, 4],
    demandScores: [2, 0, 4, 2, 5, 2, 0, 0],
  }),
];
