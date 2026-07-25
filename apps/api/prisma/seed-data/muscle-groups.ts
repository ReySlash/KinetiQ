import { BodyRegion } from '../../generated/prisma/client';

import type { MuscleGroupSeed } from './types';

export const muscleGroups: MuscleGroupSeed[] = [
  {
    name: 'Chest',
    slug: 'chest',
    description:
      'Muscles associated with movement and stabilization of the shoulder and upper arm across the front of the torso.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 100,
    imageAltText: 'Anatomical illustration highlighting the chest muscle group',
  },
  {
    name: 'Back',
    slug: 'back',
    description:
      'Muscles of the posterior torso involved in pulling, scapular movement, spinal control, and posture.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 200,
    imageAltText: 'Anatomical illustration highlighting the back muscle group',
  },
  {
    name: 'Shoulders',
    slug: 'shoulders',
    description:
      'Muscles responsible for moving and stabilizing the shoulder joint and shoulder girdle.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 300,
    imageAltText:
      'Anatomical illustration highlighting the shoulder muscle group',
  },
  {
    name: 'Biceps',
    slug: 'biceps',
    description:
      'Anterior upper-arm muscles involved primarily in elbow flexion and forearm supination.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 400,
    imageAltText:
      'Anatomical illustration highlighting the biceps muscle group',
  },
  {
    name: 'Triceps',
    slug: 'triceps',
    description:
      'Posterior upper-arm muscles responsible primarily for elbow extension.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 500,
    imageAltText:
      'Anatomical illustration highlighting the triceps muscle group',
  },
  {
    name: 'Forearms',
    slug: 'forearms',
    description:
      'Muscles controlling wrist, hand, finger, and forearm movement and contributing to grip strength.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 600,
    imageAltText:
      'Anatomical illustration highlighting the forearm muscle group',
  },
  {
    name: 'Core',
    slug: 'core',
    description:
      'Muscles responsible for trunk movement, spinal stability, force transfer, and control of the pelvis and rib cage.',
    bodyRegion: BodyRegion.CORE,
    sortOrder: 700,
    imageAltText: 'Anatomical illustration highlighting the core muscle group',
  },
  {
    name: 'Glutes',
    slug: 'glutes',
    description:
      'Posterior and lateral hip muscles involved in hip extension, abduction, rotation, and pelvic stabilization.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 800,
    imageAltText: 'Anatomical illustration highlighting the glute muscle group',
  },
  {
    name: 'Quadriceps',
    slug: 'quadriceps',
    description:
      'Anterior thigh muscles responsible primarily for knee extension and assisting hip flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 900,
    imageAltText:
      'Anatomical illustration highlighting the quadriceps muscle group',
  },
  {
    name: 'Hamstrings',
    slug: 'hamstrings',
    description:
      'Posterior thigh muscles involved in knee flexion, hip extension, and pelvic control.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 1000,
    imageAltText:
      'Anatomical illustration highlighting the hamstring muscle group',
  },
  {
    name: 'Adductors',
    slug: 'adductors',
    description:
      'Inner-thigh muscles responsible for hip adduction and contributing to hip and pelvic stability.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 1100,
    imageAltText:
      'Anatomical illustration highlighting the adductor muscle group',
  },
  {
    name: 'Hip Flexors',
    slug: 'hip-flexors',
    description:
      'Muscles contributing primarily to hip flexion and stabilization of the pelvis and lumbar region.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 1200,
    imageAltText:
      'Anatomical illustration highlighting the hip flexor muscle group',
  },
  {
    name: 'Calves',
    slug: 'calves',
    description:
      'Lower-leg muscles involved in ankle movement and control of the foot and ankle.',
    bodyRegion: BodyRegion.LOWER_BODY,
    sortOrder: 1300,
    imageAltText: 'Anatomical illustration highlighting the calf muscle group',
  },
  {
    name: 'Neck',
    slug: 'neck',
    description:
      'Muscles responsible for movement and stabilization of the cervical spine and head.',
    bodyRegion: BodyRegion.UPPER_BODY,
    sortOrder: 1400,
    imageAltText: 'Anatomical illustration highlighting the neck muscle group',
  },
];
