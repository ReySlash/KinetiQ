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

export const shouldersExercises: ExerciseSeed[] = [
  {
    name: 'Standing Barbell Overhead Press',
    slug: 'standing-barbell-overhead-press',
    description:
      'A compound vertical press performed from a standing position using a barbell.',
    instructions:
      'Stand with the bar resting near the upper chest. Brace the trunk and glutes, keep the wrists stacked over the elbows, move the head slightly back, and press the bar vertically overhead. Finish with the bar balanced over the midfoot before lowering it under control.',
    commonMistakes:
      'Excessively arching the lower back, pressing the bar around the face instead of vertically, using an excessively wide grip, losing abdominal tension, or failing to reach a stable overhead position.',
    movementPatternSlug: 'vertical-push',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.OPEN,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.STANDING,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing a standing barbell overhead press',
    equipmentSlugs: ['barbell', 'squat-rack'],
    muscles: [
      {
        muscleSlug: 'anterior-deltoid',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'lateral-deltoid',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'triceps-brachii',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'serratus-anterior',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'upper-trapezius',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'rotator-cuff',
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
      hypertrophyPotential: 4,
      maximalStrengthPotential: 4,
      powerDevelopmentPotential: 4,
      muscularEndurancePotential: 3,
      stabilityDevelopmentPotential: 4,
      typicalLoadability: 4,
      stretchPositionLoading: 2,
      shortenedPositionLoading: 4,
    },
    demands: {
      technicalDemand: 4,
      setupComplexity: 2,
      stabilityDemand: 4,
      systemicFatiguePotential: 3,
      localFatiguePotential: 4,
      recoveryCostPotential: 3,
      gripDemand: 2,
      axialLoadingPotential: 3,
    },
  },
  createExercise({
    name: 'Seated Barbell Overhead Press',
    slug: 'seated-barbell-overhead-press',
    description:
      'A seated barbell press that develops overhead strength with reduced lower-body contribution.',
    instructions:
      'Sit upright with feet planted and the bar at upper-chest height. Brace against the bench, press vertically to a balanced overhead position, and lower under control without losing rib-cage position.',
    commonMistakes:
      'Overarching the back, pressing forward of the body, flaring the elbows, shrugging early, or bouncing from the chest.',
    imageAltText: 'Athlete performing a seated barbell overhead press',
    classification: [
      'vertical-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['barbell', 'adjustable-bench', 'squat-rack'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 5],
      ['lateral-deltoid', MuscleRole.SECONDARY, 3],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 3, 3, 2, 5, 4, 4],
    demandScores: [3, 4, 2, 3, 4, 3, 2, 2],
  }),
  createExercise({
    name: 'Dumbbell Shoulder Press',
    slug: 'dumbbell-shoulder-press',
    description:
      'A dumbbell overhead press that trains the deltoids and triceps while requiring independent shoulder control.',
    instructions:
      'Sit tall with dumbbells at shoulder height and wrists stacked over elbows. Brace the trunk, press overhead without colliding the weights, and lower slowly to a comfortable depth.',
    commonMistakes:
      'Overarching, pressing too wide, losing wrist alignment, shrugging, or using uneven arm paths.',
    imageAltText: 'Athlete performing a seated dumbbell shoulder press',
    classification: [
      'vertical-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells', 'adjustable-bench'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 5],
      ['lateral-deltoid', MuscleRole.PRIMARY, 4],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 3, 2, 3, 3, 4, 4, 4],
    demandScores: [2, 2, 3, 2, 4, 3, 2, 1],
  }),
  createExercise({
    name: 'Arnold Press',
    slug: 'arnold-press',
    description:
      'A rotating dumbbell press that combines shoulder flexion and overhead pressing through a long controlled range.',
    instructions:
      'Sit with dumbbells in front of the shoulders and palms facing you. Open the arms as you press overhead, finish with palms forward, then reverse the path slowly while keeping the ribs down.',
    commonMistakes:
      'Rushing the rotation, arching the back, dropping the elbows too low, colliding the weights, or forcing painful shoulder range.',
    imageAltText: 'Athlete performing an Arnold press',
    classification: [
      'vertical-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells', 'adjustable-bench'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 5],
      ['lateral-deltoid', MuscleRole.PRIMARY, 4],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 2, 2, 4, 3, 3, 4, 4],
    demandScores: [3, 2, 3, 2, 5, 3, 2, 1],
  }),
  createExercise({
    name: 'Landmine Press',
    slug: 'landmine-press',
    description:
      'An angled unilateral barbell press that develops shoulder strength with a forward-and-upward pressing path.',
    instructions:
      'Place the bar in a landmine, hold the sleeve at one shoulder, and use a split stance. Brace against rotation, press up and forward until the arm is long, then return slowly to the shoulder.',
    commonMistakes:
      'Rotating the torso, leaning into lumbar extension, shrugging, letting the elbow flare, or standing too far from the anchor.',
    imageAltText: 'Athlete performing a single-arm landmine press',
    classification: [
      'vertical-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['barbell', 'landmine-attachment'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 5],
      ['serratus-anterior', MuscleRole.SECONDARY, 4],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['clavicular-head-pectoralis-major', MuscleRole.SECONDARY, 3],
      ['external-obliques', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 3, 3, 4, 4, 4, 3, 4],
    demandScores: [2, 2, 4, 2, 4, 2, 2, 1],
  }),
  createExercise({
    name: 'Push Press',
    slug: 'push-press',
    description:
      'An explosive overhead press that uses a coordinated leg drive to accelerate a barbell and develop whole-body power.',
    instructions:
      'Hold the bar at the shoulders, brace, dip a few inches by bending knees and hips, then drive the floor away and press overhead. Stabilize the bar over midfoot before lowering it under control.',
    commonMistakes:
      'Turning the dip into a squat, pressing before leg drive, letting the knees cave, overextending the back, or catching the bar without control.',
    imageAltText: 'Athlete performing a barbell push press',
    classification: [
      'vertical-push',
      ForceType.PUSH,
      KineticChain.MIXED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['barbell', 'weight-plates', 'squat-rack'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 4],
      ['triceps-brachii', MuscleRole.PRIMARY, 4],
      ['quadriceps', MuscleRole.SECONDARY, 3],
      ['gluteus-maximus', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [3, 4, 5, 2, 4, 5, 2, 3],
    demandScores: [4, 4, 4, 4, 3, 4, 3, 4],
  }),
  createExercise({
    name: 'Dumbbell Lateral Raise',
    slug: 'dumbbell-lateral-raise',
    description:
      'A free-weight shoulder-abduction exercise that targets the lateral deltoid for shoulder development.',
    instructions:
      'Stand tall with dumbbells by the thighs and soft elbows. Raise the arms in the scapular plane to about shoulder height, then lower slowly without relaxing the shoulders.',
    commonMistakes:
      'Swinging the torso, shrugging, leading with the hands, lifting far above shoulder height, or dropping the weights quickly.',
    imageAltText: 'Athlete performing dumbbell lateral raises',
    classification: [
      'shoulder-abduction-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['lateral-deltoid', MuscleRole.PRIMARY, 5],
      ['supraspinatus', MuscleRole.SECONDARY, 3],
      ['upper-trapezius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 1, 1, 5, 2, 2, 3, 4],
    demandScores: [2, 0, 2, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'Cable Lateral Raise',
    slug: 'cable-lateral-raise',
    description:
      'A cable shoulder-abduction exercise that maintains lateral-deltoid tension from the bottom through shoulder height.',
    instructions:
      'Stand beside a low pulley, hold the far handle, and brace without leaning. Lead the elbow outward in the scapular plane to shoulder height, then return slowly across the body.',
    commonMistakes:
      'Leaning away excessively, shrugging, swinging, bending the elbow during the rep, or letting the stack pull the arm down.',
    imageAltText: 'Athlete performing a single-arm cable lateral raise',
    classification: [
      'shoulder-abduction-pattern',
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
      ['lateral-deltoid', MuscleRole.PRIMARY, 5],
      ['supraspinatus', MuscleRole.SECONDARY, 3],
      ['upper-trapezius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 1, 1, 5, 3, 2, 4, 5],
    demandScores: [2, 1, 3, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Machine Lateral Raise',
    slug: 'machine-lateral-raise',
    description:
      'A supported shoulder-abduction exercise that isolates the lateral deltoid along a guided resistance path.',
    instructions:
      'Adjust the seat so the machine pivots align with the shoulders and place the arms against the pads. Raise to shoulder height without shrugging, pause, and lower under control.',
    commonMistakes:
      'Using a poor seat height, driving with the hands, shrugging, bouncing from the bottom, or letting the stack crash.',
    imageAltText: 'Athlete using a lateral raise machine',
    classification: [
      'shoulder-abduction-pattern',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['lateral-raise-machine'],
    muscles: [
      ['lateral-deltoid', MuscleRole.PRIMARY, 5],
      ['supraspinatus', MuscleRole.SECONDARY, 3],
      ['upper-trapezius', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 1, 1, 5, 1, 3, 4, 5],
    demandScores: [1, 1, 1, 1, 5, 2, 0, 0],
  }),
  createExercise({
    name: 'Reverse Dumbbell Fly',
    slug: 'reverse-dumbbell-fly',
    description:
      'A hinged dumbbell fly that trains the posterior deltoids and scapular retractors through horizontal abduction.',
    instructions:
      'Hinge with a braced spine and let the dumbbells hang beneath the shoulders. With soft elbows, sweep the arms outward to torso level, pause, and lower slowly without changing torso angle.',
    commonMistakes:
      'Swinging, shrugging, turning the movement into a row, rounding the back, or lifting beyond controlled range.',
    imageAltText: 'Athlete performing a bent-over reverse dumbbell fly',
    classification: [
      'horizontal-pull',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.HINGED,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['posterior-deltoid', MuscleRole.PRIMARY, 5],
      ['rhomboids', MuscleRole.SECONDARY, 3],
      ['middle-trapezius', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 3, 2, 4, 4],
    demandScores: [2, 1, 3, 1, 5, 2, 2, 1],
  }),
  createExercise({
    name: 'Cable Reverse Fly',
    slug: 'cable-reverse-fly',
    description:
      'A cable horizontal-abduction exercise that provides continuous loading to the posterior shoulders and upper back.',
    instructions:
      'Set crossed cables near shoulder height and stand centered with arms forward. Open the arms until they align with the torso, keep the ribs stacked, and return slowly without letting the shoulders roll forward.',
    commonMistakes:
      'Using excessive load, bending the elbows into a row, arching, shrugging, or allowing the handles to snap inward.',
    imageAltText: 'Athlete performing a standing cable reverse fly',
    classification: [
      'horizontal-pull',
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
      ['posterior-deltoid', MuscleRole.PRIMARY, 5],
      ['rhomboids', MuscleRole.SECONDARY, 3],
      ['middle-trapezius', MuscleRole.SECONDARY, 3],
      ['infraspinatus', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 3, 2, 4, 5],
    demandScores: [2, 2, 3, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Face Pull',
    slug: 'face-pull',
    description:
      'A high-cable pull combining scapular retraction and shoulder external rotation for posterior-shoulder and upper-back development.',
    instructions:
      'Set a rope above eye level, step back, and begin with arms extended. Pull toward the forehead while separating the rope and rotating the hands back, pause with controlled shoulder blades, then return slowly.',
    commonMistakes:
      'Pulling toward the chest, shrugging, extending the lower back, using momentum, or letting the elbows drop.',
    imageAltText: 'Athlete performing a rope face pull',
    classification: [
      'scapular-movement',
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
      ['posterior-deltoid', MuscleRole.PRIMARY, 4],
      ['infraspinatus', MuscleRole.PRIMARY, 4],
      ['teres-minor', MuscleRole.SECONDARY, 3],
      ['rhomboids', MuscleRole.SECONDARY, 4],
      ['middle-trapezius', MuscleRole.SECONDARY, 4],
    ],
    capabilityScores: [4, 1, 1, 5, 4, 2, 3, 5],
    demandScores: [2, 1, 3, 1, 4, 1, 2, 0],
  }),
];
