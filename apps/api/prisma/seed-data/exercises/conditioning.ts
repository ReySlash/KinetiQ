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

export const conditioningExercises: ExerciseSeed[] = [
  createExercise({
    name: 'Farmer’s Carry',
    slug: 'farmers-carry',
    description:
      'A bilateral loaded carry that develops grip, trunk stiffness, gait quality, and whole-body work capacity.',
    instructions:
      'Hold heavy dumbbells at the sides, stand tall with shoulders level, and brace. Walk with deliberate short steps while keeping the loads quiet, then stop under control and set them down with a hinge.',
    commonMistakes:
      'Shrugging continuously, taking hurried steps, letting the weights swing, losing upright posture, or setting the loads down with a rounded back.',
    imageAltText: 'Athlete performing a farmer’s carry with dumbbells',
    classification: [
      'loaded-carry',
      ForceType.STATIC,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.MIXED,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['forearm-flexors', MuscleRole.PRIMARY, 5],
      ['upper-trapezius', MuscleRole.SECONDARY, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
      ['external-obliques', MuscleRole.STABILIZER, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
      ['erector-spinae', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [3, 4, 2, 5, 5, 5, 1, 3],
    demandScores: [3, 1, 4, 5, 4, 4, 5, 4],
  }),
  createExercise({
    name: 'Front-rack Carry',
    slug: 'front-rack-carry',
    description:
      'A loaded carry with resistance supported at the shoulders that challenges anterior trunk bracing and upper-back posture.',
    instructions:
      'Clean dumbbells or kettlebells to the shoulders, keep the elbows comfortably forward, and stack the ribs over the pelvis. Walk with controlled steps, maintain the rack position, then lower the loads safely.',
    commonMistakes:
      'Leaning backward, dropping the elbows, holding the breath, allowing the weights to drift, or losing a steady walking rhythm.',
    imageAltText: 'Athlete performing a front-rack carry with dumbbells',
    classification: [
      'loaded-carry',
      ForceType.STATIC,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.MIXED,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['transverse-abdominis', MuscleRole.PRIMARY, 5],
      ['erector-spinae', MuscleRole.STABILIZER, 4],
      ['anterior-deltoid', MuscleRole.STABILIZER, 4],
      ['biceps-brachii', MuscleRole.STABILIZER, 3],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
      ['forearm-flexors', MuscleRole.SECONDARY, 4],
    ],
    capabilityScores: [2, 3, 2, 5, 5, 4, 1, 4],
    demandScores: [3, 2, 5, 5, 4, 4, 4, 4],
  }),
  createExercise({
    name: 'Overhead Carry',
    slug: 'overhead-carry',
    description:
      'A carry performed with loads overhead to develop shoulder stability, trunk control, and coordinated gait.',
    instructions:
      'Press the dumbbells overhead, lock the ribs down, and establish stable shoulders with the loads over midfoot. Walk slowly without arching or letting the arms drift, then stop before lowering under control.',
    commonMistakes:
      'Overextending the lower back, bending the elbows, shrugging without control, walking too quickly, or allowing the weights to move forward.',
    imageAltText: 'Athlete performing an overhead dumbbell carry',
    classification: [
      'loaded-carry',
      ForceType.STATIC,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.MIXED,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['serratus-anterior', MuscleRole.PRIMARY, 4],
      ['rotator-cuff', MuscleRole.PRIMARY, 4],
      ['upper-trapezius', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 5],
      ['external-obliques', MuscleRole.STABILIZER, 4],
      ['forearm-flexors', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 2, 2, 5, 5, 3, 1, 3],
    demandScores: [4, 2, 5, 5, 4, 4, 4, 3],
  }),
  createExercise({
    name: 'Sled Push',
    slug: 'sled-push',
    description:
      'A resisted locomotion drill that develops horizontal force, leg drive, and conditioning with minimal eccentric loading.',
    instructions:
      'Load the sled appropriately, grip the handles, lean forward with a braced neutral trunk, and drive through the floor using strong alternating steps. Keep the hips at a consistent height and decelerate safely at the finish.',
    commonMistakes:
      'Taking tiny ineffective steps, rounding the back, letting the hips rise, using too much load to move smoothly, or stopping abruptly in a crowded lane.',
    imageAltText: 'Athlete pushing a weighted training sled',
    classification: [
      'locomotion',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['sled', 'weight-plates'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 5],
      ['gastrocnemius', MuscleRole.SECONDARY, 4],
      ['soleus', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [2, 4, 4, 5, 4, 5, 1, 3],
    demandScores: [3, 3, 4, 5, 4, 3, 2, 2],
  }),
  createExercise({
    name: 'Sled Pull',
    slug: 'sled-pull',
    description:
      'A resisted backward or forward drag that builds leg strength and conditioning through continuous concentric work.',
    instructions:
      'Attach the straps securely, take tension out of them, and brace before moving. Walk with steady steps while keeping the torso controlled and line taut, then slow the sled without jerking.',
    commonMistakes:
      'Using slack in the straps, rounding, twisting, taking uncontrolled steps, or choosing a load that prevents a consistent gait.',
    imageAltText: 'Athlete pulling a weighted training sled',
    classification: [
      'locomotion',
      ForceType.PULL,
      KineticChain.CLOSED,
      true,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['sled', 'weight-plates'],
    muscles: [
      ['quadriceps', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.SECONDARY, 4],
      ['hamstrings', MuscleRole.SECONDARY, 3],
      ['gastrocnemius', MuscleRole.SECONDARY, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [2, 3, 3, 5, 4, 5, 1, 2],
    demandScores: [3, 3, 4, 5, 4, 3, 3, 1],
  }),
  createExercise({
    name: 'Battle Rope Waves',
    slug: 'battle-rope-waves',
    description:
      'A repeated rope-wave drill that develops upper-body muscular endurance and whole-body conditioning.',
    instructions:
      'Stand athletically with one rope end in each hand, brace, and create alternating waves by moving the arms rapidly from the shoulders. Keep the knees soft and torso stable, maintain even waves, and stop before posture deteriorates.',
    commonMistakes:
      'Using only the wrists, standing rigidly upright, losing wave rhythm, shrugging excessively, or continuing after trunk position fails.',
    imageAltText: 'Athlete creating alternating waves with battle ropes',
    classification: [
      'cyclical-conditioning',
      ForceType.PULL,
      KineticChain.CLOSED,
      true,
      Laterality.ALTERNATING,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['battle-ropes'],
    muscles: [
      ['anterior-deltoid', MuscleRole.PRIMARY, 4],
      ['posterior-deltoid', MuscleRole.PRIMARY, 4],
      ['forearm-flexors', MuscleRole.SECONDARY, 4],
      ['biceps-brachii', MuscleRole.SECONDARY, 3],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 4],
    ],
    capabilityScores: [2, 1, 3, 5, 4, 2, 1, 3],
    demandScores: [3, 2, 4, 5, 5, 3, 4, 1],
  }),
];
