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

export const correctiveExercises: ExerciseSeed[] = [
  createExercise({
    name: 'Band External Rotation',
    slug: 'band-external-rotation',
    description:
      'A light resistance-band drill that trains shoulder external rotation and rotator-cuff control.',
    instructions:
      'Anchor the band near elbow height, stand side-on, and hold the elbow against the torso at ninety degrees. Rotate the forearm outward without moving the upper arm, pause, and return slowly.',
    commonMistakes:
      'Rotating the torso, letting the elbow drift, extending the wrist, shrugging, or using resistance that shortens the range.',
    imageAltText:
      'Athlete performing shoulder external rotation with a resistance band',
    classification: [
      'shoulder-external-rotation-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['resistance-band'],
    muscles: [
      ['infraspinatus', MuscleRole.PRIMARY, 5],
      ['teres-minor', MuscleRole.PRIMARY, 4],
      ['posterior-deltoid', MuscleRole.SECONDARY, 2],
      ['subscapularis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [3, 1, 1, 5, 4, 1, 3, 4],
    demandScores: [2, 1, 3, 1, 4, 1, 1, 0],
  }),
  createExercise({
    name: 'Cable External Rotation',
    slug: 'cable-external-rotation',
    description:
      'A cable rotator-cuff exercise that provides measurable external-rotation resistance through a controlled arc.',
    instructions:
      'Set the pulley at elbow height and stand side-on with the elbow bent and held near the ribs. Rotate the forearm away from the torso, keep the shoulder centered, and return slowly without turning the body.',
    commonMistakes:
      'Using torso rotation, separating the elbow from the side, shrugging, bending the wrist, or forcing range beyond shoulder control.',
    imageAltText:
      'Athlete performing shoulder external rotation at a cable machine',
    classification: [
      'shoulder-external-rotation-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      false,
      Laterality.UNILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['infraspinatus', MuscleRole.PRIMARY, 5],
      ['teres-minor', MuscleRole.PRIMARY, 4],
      ['posterior-deltoid', MuscleRole.SECONDARY, 2],
      ['subscapularis', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 1, 1, 5, 4, 2, 3, 4],
    demandScores: [2, 1, 3, 1, 4, 1, 1, 0],
  }),
  createExercise({
    name: 'Scapular Pull-up',
    slug: 'scapular-pull-up',
    description:
      'A straight-arm hanging drill that trains scapular depression and upward-body movement without elbow flexion.',
    instructions:
      'Hang from a pull-up bar with straight elbows and controlled ribs. Draw the shoulder blades down to lift the body slightly, pause without bending the arms, and return slowly to a supported hang.',
    commonMistakes:
      'Bending the elbows, shrugging abruptly, swinging, overextending the back, or forcing a large range.',
    imageAltText: 'Athlete performing a straight-arm scapular pull-up',
    classification: [
      'scapular-movement',
      ForceType.PULL,
      KineticChain.CLOSED,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.OTHER,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight', 'pull-up-bar'],
    muscles: [
      ['lower-trapezius', MuscleRole.PRIMARY, 5],
      ['latissimus-dorsi', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
      ['forearm-flexors', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [3, 2, 1, 5, 5, 1, 3, 4],
    demandScores: [2, 0, 4, 1, 4, 1, 4, 0],
  }),
  createExercise({
    name: 'Wall Slide',
    slug: 'wall-slide',
    description:
      'A wall-supported overhead reach that trains scapular upward rotation, serratus control, and rib-cage positioning.',
    instructions:
      'Stand with the back near a wall and forearms supported against it. Exhale to stack the ribs, slide the arms upward while gently pressing into the wall, then return without shrugging or losing contact.',
    commonMistakes:
      'Arching the lower back, forcing the wrists to the wall, shrugging, letting the elbows flare, or moving beyond controlled range.',
    imageAltText: 'Athlete performing a forearm wall slide',
    classification: [
      'scapular-movement',
      ForceType.PUSH,
      KineticChain.OPEN,
      false,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['serratus-anterior', MuscleRole.PRIMARY, 5],
      ['lower-trapezius', MuscleRole.PRIMARY, 4],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [2, 1, 1, 5, 4, 1, 3, 4],
    demandScores: [2, 0, 3, 1, 3, 1, 0, 0],
  }),
  createExercise({
    name: 'Copenhagen Plank',
    slug: 'copenhagen-plank',
    description:
      'A side-support exercise with the upper leg supported that trains the hip adductors and lateral trunk stability.',
    instructions:
      'Place the upper leg on a bench and support the torso on the lower forearm. Lift the hips and lower leg to form a straight line, brace and breathe, then lower under control before changing sides.',
    commonMistakes:
      'Using an unsupported knee position too advanced for current strength, letting the hips sag, rotating the pelvis, shrugging, or holding the breath.',
    imageAltText:
      'Athlete holding a Copenhagen plank with the upper leg on a bench',
    classification: [
      'anti-rotation',
      ForceType.STATIC,
      KineticChain.CLOSED,
      false,
      Laterality.UNILATERAL,
      ContractionMode.ISOMETRIC,
      BodyPosition.OTHER,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight', 'bench'],
    muscles: [
      ['hip-adductors', MuscleRole.PRIMARY, 5],
      ['external-obliques', MuscleRole.PRIMARY, 4],
      ['internal-obliques', MuscleRole.SECONDARY, 4],
      ['gluteus-medius', MuscleRole.STABILIZER, 3],
      ['serratus-anterior', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [3, 2, 0, 4, 5, 2, 3, 3],
    demandScores: [3, 1, 5, 2, 5, 3, 0, 0],
  }),
  createExercise({
    name: 'Back Extension',
    slug: 'back-extension',
    description:
      'A bench-supported hinge that trains the spinal extensors, glutes, and hamstrings through controlled trunk and hip extension.',
    instructions:
      'Set the pad below the hip crease and secure the feet. Hinge forward with a braced neutral spine, stop at a comfortable range, then extend the hips and trunk until the body forms a straight line.',
    commonMistakes:
      'Hyperextending above neutral, rounding under load, setting the pad too high, using momentum, or turning the movement into repeated lumbar flexion.',
    imageAltText:
      'Athlete performing a back extension on a hyperextension bench',
    classification: [
      'hip-extension-pattern',
      ForceType.PULL,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.PRONE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight', 'back-extension-bench'],
    muscles: [
      ['erector-spinae', MuscleRole.PRIMARY, 5],
      ['gluteus-maximus', MuscleRole.PRIMARY, 4],
      ['hamstrings', MuscleRole.SECONDARY, 4],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 3, 2, 4, 3, 3, 5, 3],
    demandScores: [2, 2, 3, 3, 4, 3, 0, 2],
  }),
];
