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

export const coreExercises: ExerciseSeed[] = [
  {
    name: 'Forearm Plank',
    slug: 'forearm-plank',
    description:
      'An isometric anti-extension exercise that trains the trunk to resist lumbar extension.',
    instructions:
      'Support the body on the forearms and toes. Position the elbows beneath the shoulders, lightly tuck the pelvis, brace the abdominal wall, contract the glutes, and maintain a straight line from the head through the heels.',
    commonMistakes:
      'Allowing the lower back to sag, raising the hips excessively, holding the breath, shrugging the shoulders, or continuing after trunk position is lost.',
    movementPatternSlug: 'anti-extension',
    forceType: ForceType.STATIC,
    kineticChain: KineticChain.CLOSED,
    isCompound: false,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.ISOMETRIC,
    bodyPosition: BodyPosition.PRONE,
    skillLevel: SkillLevel.BEGINNER,
    imageAltText: 'Athlete holding a forearm plank position',
    equipmentSlugs: ['bodyweight'],
    muscles: [
      {
        muscleSlug: 'transverse-abdominis',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'rectus-abdominis',
        role: MuscleRole.PRIMARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'external-obliques',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'internal-obliques',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'gluteus-maximus',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
      {
        muscleSlug: 'serratus-anterior',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
    ],
    capabilities: {
      hypertrophyPotential: 2,
      maximalStrengthPotential: 1,
      powerDevelopmentPotential: 0,
      muscularEndurancePotential: 5,
      stabilityDevelopmentPotential: 5,
      typicalLoadability: 1,
      stretchPositionLoading: 0,
      shortenedPositionLoading: 2,
    },
    demands: {
      technicalDemand: 1,
      setupComplexity: 0,
      stabilityDemand: 4,
      systemicFatiguePotential: 1,
      localFatiguePotential: 3,
      recoveryCostPotential: 1,
      gripDemand: 0,
      axialLoadingPotential: 0,
    },
  },
  createExercise({
    name: 'Side Plank',
    slug: 'side-plank',
    description:
      'A lateral isometric support that trains the obliques and trunk to resist side bending while controlling the pelvis.',
    instructions:
      'Lie on one side with the elbow under the shoulder and legs extended. Lift the hips to form a straight line, brace the trunk, keep the pelvis stacked, and breathe while holding before lowering with control.',
    commonMistakes:
      'Letting the hips sag, rotating the chest down, shrugging the support shoulder, holding the breath, or placing the elbow too far away.',
    imageAltText: 'Athlete holding a side plank',
    classification: [
      'anti-rotation',
      ForceType.STATIC,
      KineticChain.CLOSED,
      false,
      Laterality.UNILATERAL,
      ContractionMode.ISOMETRIC,
      BodyPosition.OTHER,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['external-obliques', MuscleRole.PRIMARY, 5],
      ['internal-obliques', MuscleRole.PRIMARY, 5],
      ['transverse-abdominis', MuscleRole.SECONDARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['serratus-anterior', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 1, 0, 5, 5, 1, 1, 2],
    demandScores: [2, 0, 5, 1, 4, 1, 0, 0],
  }),
  createExercise({
    name: 'Dead Bug',
    slug: 'dead-bug',
    description:
      'A supine contralateral limb drill that develops anti-extension control while the arms and legs move away from the trunk.',
    instructions:
      'Lie supine with hips and knees bent and arms vertical. Exhale to stack the ribs, slowly extend the opposite arm and leg without the back lifting, return, and alternate sides.',
    commonMistakes:
      'Arching the lower back, moving too quickly, holding the breath, extending beyond controlled range, or losing coordination.',
    imageAltText: 'Athlete performing the dead bug core exercise',
    classification: [
      'anti-extension',
      ForceType.STATIC,
      KineticChain.OPEN,
      false,
      Laterality.ALTERNATING,
      ContractionMode.MIXED,
      BodyPosition.SUPINE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['transverse-abdominis', MuscleRole.PRIMARY, 5],
      ['rectus-abdominis', MuscleRole.SECONDARY, 4],
      ['external-obliques', MuscleRole.SECONDARY, 3],
      ['iliopsoas', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [1, 1, 0, 4, 5, 1, 1, 2],
    demandScores: [2, 0, 4, 1, 3, 1, 0, 0],
  }),
  createExercise({
    name: 'Bird Dog',
    slug: 'bird-dog',
    description:
      'A quadruped contralateral reach that trains spinal stability and pelvic control during limb movement.',
    instructions:
      'Start on hands and knees with a neutral spine. Brace, reach one arm forward and the opposite leg back without rotating, pause while staying long, then return slowly and alternate.',
    commonMistakes:
      'Rotating the pelvis, arching the back, lifting the leg too high, shifting weight abruptly, or rushing the return.',
    imageAltText: 'Athlete performing the bird dog exercise',
    classification: [
      'anti-rotation',
      ForceType.STATIC,
      KineticChain.CLOSED,
      false,
      Laterality.ALTERNATING,
      ContractionMode.MIXED,
      BodyPosition.OTHER,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['transverse-abdominis', MuscleRole.PRIMARY, 5],
      ['erector-spinae', MuscleRole.SECONDARY, 3],
      ['gluteus-maximus', MuscleRole.SECONDARY, 3],
      ['external-obliques', MuscleRole.STABILIZER, 4],
      ['serratus-anterior', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [1, 1, 0, 4, 5, 1, 1, 2],
    demandScores: [2, 0, 5, 1, 3, 1, 0, 0],
  }),
  createExercise({
    name: 'Ab Wheel Rollout',
    slug: 'ab-wheel-rollout',
    description:
      'A kneeling rollout that heavily loads the abdominal wall as it resists spinal extension through a long lever.',
    instructions:
      'Kneel with the wheel beneath the shoulders, brace the glutes and ribs, and roll forward while maintaining a slightly rounded trunk. Stop before the lower back extends, then pull the wheel back by closing the shoulder angle and maintaining the brace.',
    commonMistakes:
      'Sagging the lower back, leading back with the hips, rolling beyond control, bending the elbows, or holding the breath.',
    imageAltText: 'Athlete performing a kneeling ab wheel rollout',
    classification: [
      'anti-extension',
      ForceType.PULL,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.KNEELING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['ab-wheel'],
    muscles: [
      ['rectus-abdominis', MuscleRole.PRIMARY, 5],
      ['transverse-abdominis', MuscleRole.PRIMARY, 5],
      ['external-obliques', MuscleRole.SECONDARY, 4],
      ['latissimus-dorsi', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 1, 4, 5, 3, 5, 3],
    demandScores: [4, 1, 5, 2, 5, 3, 2, 0],
  }),
  createExercise({
    name: 'Hanging Knee Raise',
    slug: 'hanging-knee-raise',
    description:
      'A hanging trunk-and-hip flexion exercise that trains the abdominals while requiring grip and shoulder stability.',
    instructions:
      'Hang from the bar with controlled shoulders and legs still. Exhale, curl the pelvis, and raise the knees toward the chest without swinging, then lower slowly to a quiet hang.',
    commonMistakes:
      'Swinging, lifting only from the hips, losing shoulder position, dropping the legs, or using momentum to start each rep.',
    imageAltText: 'Athlete performing a hanging knee raise',
    classification: [
      'spinal-flexion',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.OTHER,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight', 'pull-up-bar'],
    muscles: [
      ['rectus-abdominis', MuscleRole.PRIMARY, 5],
      ['iliopsoas', MuscleRole.SECONDARY, 4],
      ['external-obliques', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 4],
      ['latissimus-dorsi', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 2, 4, 4, 2, 3, 4],
    demandScores: [3, 1, 4, 2, 5, 2, 5, 0],
  }),
  createExercise({
    name: 'Hanging Leg Raise',
    slug: 'hanging-leg-raise',
    description:
      'An advanced hanging raise using straighter legs to increase abdominal, hip-flexor, grip, and shoulder demands.',
    instructions:
      'Hang without swinging and brace the ribs. Raise the straight or softly bent legs by curling the pelvis until they approach horizontal or higher, then lower slowly while maintaining shoulder control.',
    commonMistakes:
      'Swinging, bending and kicking the legs, failing to posteriorly tilt the pelvis, shrugging, or dropping from the top.',
    imageAltText: 'Athlete performing a hanging straight-leg raise',
    classification: [
      'spinal-flexion',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.OTHER,
      SkillLevel.ADVANCED,
    ],
    equipmentSlugs: ['bodyweight', 'pull-up-bar'],
    muscles: [
      ['rectus-abdominis', MuscleRole.PRIMARY, 5],
      ['iliopsoas', MuscleRole.SECONDARY, 5],
      ['external-obliques', MuscleRole.SECONDARY, 4],
      ['forearm-flexors', MuscleRole.STABILIZER, 4],
      ['latissimus-dorsi', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 2, 4, 5, 3, 4, 4],
    demandScores: [4, 1, 5, 3, 5, 3, 5, 0],
  }),
  createExercise({
    name: 'Reverse Crunch',
    slug: 'reverse-crunch',
    description:
      'A supine spinal-flexion exercise that emphasizes controlled posterior pelvic tilt rather than leg momentum.',
    instructions:
      'Lie supine with hips and knees bent and arms braced lightly. Exhale, curl the pelvis to lift the tailbone from the floor, pause, and lower each spinal segment slowly without swinging the legs.',
    commonMistakes:
      'Throwing the legs overhead, pressing excessively with the arms, lifting the whole back, rushing the return, or losing abdominal tension.',
    imageAltText: 'Athlete performing a reverse crunch',
    classification: [
      'spinal-flexion',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['rectus-abdominis', MuscleRole.PRIMARY, 5],
      ['external-obliques', MuscleRole.SECONDARY, 3],
      ['internal-obliques', MuscleRole.SECONDARY, 3],
      ['iliopsoas', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [4, 1, 1, 5, 2, 1, 3, 5],
    demandScores: [2, 0, 2, 1, 5, 1, 0, 0],
  }),
  createExercise({
    name: 'Cable Crunch',
    slug: 'cable-crunch',
    description:
      'A kneeling loaded spinal-flexion exercise that permits progressive overload of the abdominal wall.',
    instructions:
      'Kneel facing a high cable with the rope beside the head. Keep the hips relatively fixed, exhale and flex the spine to bring the ribs toward the pelvis, then return slowly without letting the stack lift the torso.',
    commonMistakes:
      'Hinging only at the hips, pulling with the arms, sitting onto the heels, arching at the top, or using momentum.',
    imageAltText: 'Athlete performing a kneeling cable crunch',
    classification: [
      'spinal-flexion',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.KNEELING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['rectus-abdominis', MuscleRole.PRIMARY, 5],
      ['external-obliques', MuscleRole.SECONDARY, 3],
      ['internal-obliques', MuscleRole.SECONDARY, 3],
    ],
    capabilityScores: [5, 3, 1, 4, 2, 4, 4, 5],
    demandScores: [2, 2, 2, 1, 5, 2, 2, 0],
  }),
  createExercise({
    name: 'Pallof Press',
    slug: 'pallof-press',
    description:
      'A cable anti-rotation press that trains the trunk to resist transverse-plane force as the arms extend.',
    instructions:
      'Stand side-on to a cable with the handle at the sternum and feet stable. Brace, press the handle straight forward without rotating, pause at arm’s length, and return slowly before changing sides.',
    commonMistakes:
      'Rotating toward the machine, leaning away, losing rib position, locking the knees, or pressing on a diagonal.',
    imageAltText: 'Athlete performing a standing Pallof press',
    classification: [
      'anti-rotation',
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
      ['external-obliques', MuscleRole.PRIMARY, 5],
      ['internal-obliques', MuscleRole.PRIMARY, 5],
      ['transverse-abdominis', MuscleRole.PRIMARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 1, 0, 5, 5, 2, 2, 3],
    demandScores: [2, 1, 5, 1, 4, 1, 1, 0],
  }),
  createExercise({
    name: 'Cable Wood Chop',
    slug: 'cable-wood-chop',
    description:
      'A diagonal cable rotation that trains coordinated trunk rotation and force transfer through the hips and shoulders.',
    instructions:
      'Stand side-on to the cable with both hands on the handle. Brace, rotate through the torso and hips to move the handle diagonally across the body, then return under control without being pulled off balance.',
    commonMistakes:
      'Moving only the arms, twisting through the knees, rounding, using momentum, or losing control near the stack.',
    imageAltText: 'Athlete performing a diagonal cable wood chop',
    classification: [
      'rotation',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['external-obliques', MuscleRole.PRIMARY, 5],
      ['internal-obliques', MuscleRole.PRIMARY, 5],
      ['transverse-abdominis', MuscleRole.SECONDARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 2],
    ],
    capabilityScores: [3, 2, 3, 5, 5, 3, 3, 4],
    demandScores: [3, 2, 4, 2, 4, 2, 2, 1],
  }),
  createExercise({
    name: 'Suitcase Carry',
    slug: 'suitcase-carry',
    description:
      'A unilateral loaded carry that trains grip, gait, and the trunk’s ability to resist lateral flexion.',
    instructions:
      'Hold one heavy dumbbell at the side, stand tall with level shoulders, and brace. Walk with controlled steps while keeping the load quiet and torso vertical, then set it down safely and repeat on the other side.',
    commonMistakes:
      'Leaning toward or away from the load, shrugging, taking hurried steps, losing grip posture, or allowing the weight to swing.',
    imageAltText: 'Athlete performing a one-sided suitcase carry',
    classification: [
      'loaded-carry',
      ForceType.STATIC,
      KineticChain.CLOSED,
      true,
      Laterality.UNILATERAL,
      ContractionMode.MIXED,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['external-obliques', MuscleRole.PRIMARY, 5],
      ['internal-obliques', MuscleRole.PRIMARY, 4],
      ['forearm-flexors', MuscleRole.SECONDARY, 5],
      ['gluteus-medius', MuscleRole.STABILIZER, 4],
      ['upper-trapezius', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [2, 3, 2, 5, 5, 4, 1, 3],
    demandScores: [3, 1, 5, 4, 4, 3, 5, 3],
  }),
];
