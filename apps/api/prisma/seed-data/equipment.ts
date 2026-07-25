import type { EquipmentSeed } from './types';

export const equipment: EquipmentSeed[] = [
  {
    name: 'Bodyweight',
    slug: 'bodyweight',
    description:
      'Exercises performed primarily using the athlete’s own body mass as resistance.',
    sortOrder: 100,
    isActive: true,
  },
  {
    name: 'Barbell',
    slug: 'barbell',
    description:
      'A long free-weight bar designed to hold weight plates and support bilateral or unilateral resistance exercises.',
    sortOrder: 200,
    isActive: true,
  },
  {
    name: 'Dumbbells',
    slug: 'dumbbells',
    description:
      'Handheld free weights that allow independent movement of each arm.',
    sortOrder: 300,
    isActive: true,
  },
  {
    name: 'Bench',
    slug: 'bench',
    description:
      'A flat or adjustable training bench used to support seated, supine, or prone exercises.',
    sortOrder: 400,
    isActive: true,
  },
  {
    name: 'Pull-up bar',
    slug: 'pull-up-bar',
    description:
      'A fixed overhead bar used for vertical pulling and hanging exercises.',
    sortOrder: 500,
    isActive: true,
  },
  {
    name: 'Squat rack',
    slug: 'squat-rack',
    description: 'A rack used to support and safely position a loaded barbell.',
    sortOrder: 600,
    isActive: true,
  },
  {
    name: 'Cable machine',
    slug: 'cable-machine',
    description:
      'A pulley-based resistance machine that provides continuous external tension.',
    sortOrder: 700,
    isActive: true,
  },
  {
    name: 'EZ Bar',
    slug: 'ez-bar',
    description:
      'A short angled bar that permits varied wrist positions during arm exercises.',
    sortOrder: 800,
    isActive: true,
  },
  {
    name: 'Kettlebell',
    slug: 'kettlebell',
    description:
      'A handled free weight suited to ballistic, unilateral, and carry exercises.',
    sortOrder: 900,
    isActive: true,
  },
  {
    name: 'Weight Plates',
    slug: 'weight-plates',
    description:
      'Removable plates used to load barbells, machines, or bodyweight exercises.',
    sortOrder: 1000,
    isActive: true,
  },
  {
    name: 'Adjustable Bench',
    slug: 'adjustable-bench',
    description:
      'A training bench whose back support can be set to flat, incline, or decline positions.',
    sortOrder: 1100,
    isActive: true,
  },
  {
    name: 'Parallel Bars',
    slug: 'parallel-bars',
    description:
      'A pair of fixed bars used for dips, supports, and bodyweight pressing.',
    sortOrder: 1200,
    isActive: true,
  },
  {
    name: 'Smith Machine',
    slug: 'smith-machine',
    description:
      'A barbell fixed to guide rails for vertically constrained resistance exercises.',
    sortOrder: 1300,
    isActive: true,
  },
  {
    name: 'Chest Press Machine',
    slug: 'chest-press-machine',
    description:
      'A selectorized or plate-loaded machine that guides a horizontal pressing path.',
    sortOrder: 1400,
    isActive: true,
  },
  {
    name: 'Row Machine',
    slug: 'row-machine',
    description:
      'A supported resistance machine designed for horizontal pulling movements.',
    sortOrder: 1500,
    isActive: true,
  },
  {
    name: 'Lat Pulldown Machine',
    slug: 'lat-pulldown-machine',
    description:
      'A seated cable station designed for vertical pulling exercises.',
    sortOrder: 1600,
    isActive: true,
  },
  {
    name: 'Leg Press Machine',
    slug: 'leg-press-machine',
    description:
      'A supported lower-body machine used to press a weighted platform away from the torso.',
    sortOrder: 1700,
    isActive: true,
  },
  {
    name: 'Hack Squat Machine',
    slug: 'hack-squat-machine',
    description:
      'A guided squat machine with torso support and a fixed resistance path.',
    sortOrder: 1800,
    isActive: true,
  },
  {
    name: 'Leg Extension Machine',
    slug: 'leg-extension-machine',
    description:
      'A seated machine that applies resistance to open-chain knee extension.',
    sortOrder: 1900,
    isActive: true,
  },
  {
    name: 'Leg Curl Machine',
    slug: 'leg-curl-machine',
    description:
      'A machine that applies resistance to seated or lying knee flexion.',
    sortOrder: 2000,
    isActive: true,
  },
  {
    name: 'Calf Raise Machine',
    slug: 'calf-raise-machine',
    description:
      'A machine designed to load standing or seated ankle plantar flexion.',
    sortOrder: 2100,
    isActive: true,
  },
  {
    name: 'Hip Abduction Machine',
    slug: 'hip-abduction-machine',
    description:
      'A seated machine that loads movement of the thighs away from the midline.',
    sortOrder: 2200,
    isActive: true,
  },
  {
    name: 'Back Extension Bench',
    slug: 'back-extension-bench',
    description:
      'An angled or horizontal bench that supports the pelvis during trunk and hip extension.',
    sortOrder: 2300,
    isActive: true,
  },
  {
    name: 'Resistance Band',
    slug: 'resistance-band',
    description:
      'An elastic band that provides accommodating resistance for strength and corrective work.',
    sortOrder: 2400,
    isActive: true,
  },
  {
    name: 'Medicine Ball',
    slug: 'medicine-ball',
    description:
      'A weighted ball designed for throws, catches, and dynamic trunk exercises.',
    sortOrder: 2500,
    isActive: true,
  },
  {
    name: 'Plyometric Box',
    slug: 'plyometric-box',
    description:
      'A stable raised platform used for jumps, step-ups, and elevated bodyweight drills.',
    sortOrder: 2600,
    isActive: true,
  },
  {
    name: 'Ab Wheel',
    slug: 'ab-wheel',
    description:
      'A handled rolling wheel used to load anti-extension trunk exercises.',
    sortOrder: 2700,
    isActive: true,
  },
  {
    name: 'Sled',
    slug: 'sled',
    description:
      'A plate-loaded implement pushed or pulled across the floor for strength and conditioning.',
    sortOrder: 2800,
    isActive: true,
  },
  {
    name: 'Battle Ropes',
    slug: 'battle-ropes',
    description:
      'Heavy anchored ropes used for repeated upper-body waves and conditioning intervals.',
    sortOrder: 2900,
    isActive: true,
  },
  {
    name: 'Landmine Attachment',
    slug: 'landmine-attachment',
    description:
      'A pivoting floor attachment that anchors one end of a barbell for angled pressing and pulling.',
    sortOrder: 3000,
    isActive: true,
  },
  {
    name: 'Lateral Raise Machine',
    slug: 'lateral-raise-machine',
    description:
      'A seated machine that guides shoulder abduction through padded arm supports.',
    sortOrder: 3100,
    isActive: true,
  },
];
