import type { MovementPatternSeed } from './types';

export const movementPatterns: MovementPatternSeed[] = [
  {
    name: 'Horizontal push',
    slug: 'horizontal-push',
    description:
      'Pressing resistance away from the torso primarily in the horizontal plane.',
    sortOrder: 100,
    isActive: true,
  },
  {
    name: 'Vertical push',
    slug: 'vertical-push',
    description:
      'Pressing resistance overhead primarily in the vertical plane.',
    sortOrder: 200,
    isActive: true,
  },
  {
    name: 'Horizontal pull',
    slug: 'horizontal-pull',
    description:
      'Pulling resistance toward the torso primarily in the horizontal plane.',
    sortOrder: 300,
    isActive: true,
  },
  {
    name: 'Vertical pull',
    slug: 'vertical-pull',
    description:
      'Pulling the body or resistance through a primarily vertical path.',
    sortOrder: 400,
    isActive: true,
  },
  {
    name: 'Squat',
    slug: 'squat',
    description:
      'A knee- and hip-dominant lower-body pattern involving coordinated flexion and extension.',
    sortOrder: 500,
    isActive: true,
  },
  {
    name: 'Hip hinge',
    slug: 'hip-hinge',
    description:
      'A movement driven primarily by hip flexion and extension with limited knee displacement.',
    sortOrder: 600,
    isActive: true,
  },
  {
    name: 'Lunge',
    slug: 'lunge',
    description:
      'A split-stance lower-body pattern emphasizing unilateral or alternating leg action.',
    sortOrder: 700,
    isActive: true,
  },
  {
    name: 'Hip extension',
    slug: 'hip-extension-pattern',
    description:
      'A movement pattern focused on extending the hip from a flexed position.',
    sortOrder: 800,
    isActive: true,
  },
  {
    name: 'Elbow flexion',
    slug: 'elbow-flexion-pattern',
    description:
      'An isolation-oriented pattern that reduces the angle between the forearm and upper arm.',
    sortOrder: 900,
    isActive: true,
  },
  {
    name: 'Elbow extension',
    slug: 'elbow-extension-pattern',
    description:
      'An isolation-oriented pattern that straightens the elbow against resistance.',
    sortOrder: 1000,
    isActive: true,
  },
  {
    name: 'Ankle plantar flexion',
    slug: 'ankle-plantar-flexion-pattern',
    description:
      'A lower-leg pattern that raises the heel by extending the ankle.',
    sortOrder: 1100,
    isActive: true,
  },
  {
    name: 'Anti-extension',
    slug: 'anti-extension',
    description:
      'A trunk-stability pattern that resists excessive extension of the lumbar spine.',
    sortOrder: 1200,
    isActive: true,
  },
  {
    name: 'Shoulder abduction',
    slug: 'shoulder-abduction-pattern',
    description:
      'Raising the arm away from the torso against resistance in the frontal or scapular plane.',
    sortOrder: 1300,
    isActive: true,
  },
  {
    name: 'Shoulder external rotation',
    slug: 'shoulder-external-rotation-pattern',
    description:
      'Rotating the upper arm outward while controlling the shoulder joint.',
    sortOrder: 1400,
    isActive: true,
  },
  {
    name: 'Scapular movement',
    slug: 'scapular-movement',
    description:
      'Moving or controlling the shoulder blades independently of large arm motion.',
    sortOrder: 1500,
    isActive: true,
  },
  {
    name: 'Spinal flexion',
    slug: 'spinal-flexion',
    description:
      'Flexing the trunk by drawing the rib cage and pelvis toward one another.',
    sortOrder: 1600,
    isActive: true,
  },
  {
    name: 'Anti-rotation',
    slug: 'anti-rotation',
    description:
      'A trunk-stability pattern that resists rotation under asymmetric force.',
    sortOrder: 1700,
    isActive: true,
  },
  {
    name: 'Rotation',
    slug: 'rotation',
    description:
      'Rotating the trunk through a controlled transverse-plane movement.',
    sortOrder: 1800,
    isActive: true,
  },
  {
    name: 'Hip abduction',
    slug: 'hip-abduction-pattern',
    description:
      'Moving the thigh away from the body midline while controlling the pelvis.',
    sortOrder: 1900,
    isActive: true,
  },
  {
    name: 'Loaded carry',
    slug: 'loaded-carry',
    description:
      'Walking while supporting external resistance in a defined carrying position.',
    sortOrder: 2000,
    isActive: true,
  },
  {
    name: 'Locomotion',
    slug: 'locomotion',
    description:
      'Producing repeated whole-body force to move across the ground.',
    sortOrder: 2100,
    isActive: true,
  },
  {
    name: 'Jump',
    slug: 'jump',
    description:
      'Rapidly producing lower-body force to leave the ground and land under control.',
    sortOrder: 2200,
    isActive: true,
  },
  {
    name: 'Throw',
    slug: 'throw',
    description:
      'Accelerating and releasing an implement to develop upper-body power.',
    sortOrder: 2300,
    isActive: true,
  },
  {
    name: 'Olympic pull',
    slug: 'olympic-pull',
    description:
      'An explosive extension pattern derived from weightlifting pull variations.',
    sortOrder: 2400,
    isActive: true,
  },
  {
    name: 'Knee flexion',
    slug: 'knee-flexion-pattern',
    description:
      'Bending the knee against resistance with the hip position controlled.',
    sortOrder: 2500,
    isActive: true,
  },
  {
    name: 'Ankle dorsiflexion',
    slug: 'ankle-dorsiflexion-pattern',
    description: 'Drawing the forefoot toward the shin against resistance.',
    sortOrder: 2600,
    isActive: true,
  },
  {
    name: 'Cyclical conditioning',
    slug: 'cyclical-conditioning',
    description:
      'Repeating a simple force pattern continuously to develop work capacity.',
    sortOrder: 2700,
    isActive: true,
  },
];
