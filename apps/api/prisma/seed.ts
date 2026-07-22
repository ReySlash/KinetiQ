import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { BodyRegion, PrismaClient } from '../generated/prisma/client';

type MuscleGroupSeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type MuscleSeed = {
  name: string;
  slug: string;
  description: string;
  bodyRegion: BodyRegion;
  muscleGroupSlug: string;
  parentSlug?: string;
  imageAltText: string;
  sortOrder: number;
};

const muscleGroups: MuscleGroupSeed[] = [
  {
    name: 'Chest',
    slug: 'chest',
    description:
      'Muscles associated with movement and stabilization of the shoulder and upper arm across the front of the torso.',
    sortOrder: 100,
  },
  {
    name: 'Back',
    slug: 'back',
    description:
      'Muscles of the posterior torso involved in pulling, scapular movement, spinal control, and posture.',
    sortOrder: 200,
  },
  {
    name: 'Shoulders',
    slug: 'shoulders',
    description:
      'Muscles responsible for moving and stabilizing the shoulder joint and shoulder girdle.',
    sortOrder: 300,
  },
  {
    name: 'Biceps',
    slug: 'biceps',
    description:
      'Anterior upper-arm muscles involved primarily in elbow flexion and forearm supination.',
    sortOrder: 400,
  },
  {
    name: 'Triceps',
    slug: 'triceps',
    description:
      'Posterior upper-arm muscles responsible primarily for elbow extension.',
    sortOrder: 500,
  },
  {
    name: 'Forearms',
    slug: 'forearms',
    description:
      'Muscles controlling wrist, hand, finger, and forearm movement and contributing to grip strength.',
    sortOrder: 600,
  },
  {
    name: 'Core',
    slug: 'core',
    description:
      'Muscles responsible for trunk movement, spinal stability, force transfer, and control of the pelvis and rib cage.',
    sortOrder: 700,
  },
  {
    name: 'Glutes',
    slug: 'glutes',
    description:
      'Posterior and lateral hip muscles involved in hip extension, abduction, rotation, and pelvic stabilization.',
    sortOrder: 800,
  },
  {
    name: 'Quadriceps',
    slug: 'quadriceps',
    description:
      'Anterior thigh muscles responsible primarily for knee extension and assisting hip flexion.',
    sortOrder: 900,
  },
  {
    name: 'Hamstrings',
    slug: 'hamstrings',
    description:
      'Posterior thigh muscles involved in knee flexion, hip extension, and pelvic control.',
    sortOrder: 1000,
  },
  {
    name: 'Adductors',
    slug: 'adductors',
    description:
      'Inner-thigh muscles responsible for hip adduction and contributing to hip and pelvic stability.',
    sortOrder: 1100,
  },
  {
    name: 'Hip Flexors',
    slug: 'hip-flexors',
    description:
      'Muscles contributing primarily to hip flexion and stabilization of the pelvis and lumbar region.',
    sortOrder: 1200,
  },
  {
    name: 'Calves',
    slug: 'calves',
    description:
      'Lower-leg muscles involved in ankle movement and control of the foot and ankle.',
    sortOrder: 1300,
  },
  {
    name: 'Neck',
    slug: 'neck',
    description:
      'Muscles responsible for movement and stabilization of the cervical spine and head.',
    sortOrder: 1400,
  },
];

const parentMuscles: MuscleSeed[] = [
  {
    name: 'Pectoralis major',
    slug: 'pectoralis-major',
    description:
      'A large chest muscle responsible for shoulder horizontal adduction, internal rotation, and assisting shoulder flexion and extension.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'chest',
    imageAltText: 'Anatomical illustration highlighting the pectoralis major',
    sortOrder: 100,
  },
  {
    name: 'Pectoralis minor',
    slug: 'pectoralis-minor',
    description:
      'A smaller chest muscle located beneath the pectoralis major that contributes to scapular protraction, depression, and stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'chest',
    imageAltText: 'Anatomical illustration highlighting the pectoralis minor',
    sortOrder: 200,
  },
  {
    name: 'Serratus anterior',
    slug: 'serratus-anterior',
    description:
      'A muscle along the rib cage that protracts and upwardly rotates the scapula while helping keep it against the torso.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'chest',
    imageAltText: 'Anatomical illustration highlighting the serratus anterior',
    sortOrder: 300,
  },

  {
    name: 'Latissimus dorsi',
    slug: 'latissimus-dorsi',
    description:
      'A large back muscle responsible for shoulder extension, adduction, and internal rotation.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    imageAltText: 'Anatomical illustration highlighting the latissimus dorsi',
    sortOrder: 400,
  },
  {
    name: 'Trapezius',
    slug: 'trapezius',
    description:
      'A broad upper-back muscle that controls elevation, retraction, depression, and upward rotation of the scapula.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    imageAltText: 'Anatomical illustration highlighting the trapezius',
    sortOrder: 500,
  },
  {
    name: 'Rhomboids',
    slug: 'rhomboids',
    description:
      'Upper-back muscles responsible primarily for scapular retraction, downward rotation, and stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    imageAltText: 'Anatomical illustration highlighting the rhomboid muscles',
    sortOrder: 600,
  },
  {
    name: 'Teres major',
    slug: 'teres-major',
    description:
      'A posterior shoulder muscle that assists shoulder extension, adduction, and internal rotation.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    imageAltText: 'Anatomical illustration highlighting the teres major',
    sortOrder: 700,
  },
  {
    name: 'Erector spinae',
    slug: 'erector-spinae',
    description:
      'A group of muscles running along the spine that extend and laterally flex the vertebral column and maintain posture.',
    bodyRegion: BodyRegion.CORE,
    muscleGroupSlug: 'back',
    imageAltText: 'Anatomical illustration highlighting the erector spinae',
    sortOrder: 800,
  },

  {
    name: 'Deltoid',
    slug: 'deltoid',
    description:
      'The primary shoulder muscle, contributing to shoulder flexion, abduction, extension, and stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    imageAltText: 'Anatomical illustration highlighting the deltoid muscle',
    sortOrder: 900,
  },
  {
    name: 'Rotator cuff',
    slug: 'rotator-cuff',
    description:
      'A group of four muscles that stabilize the shoulder joint and contribute to rotation and elevation of the arm.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    imageAltText:
      'Anatomical illustration highlighting the rotator cuff muscles',
    sortOrder: 1000,
  },

  {
    name: 'Biceps brachii',
    slug: 'biceps-brachii',
    description:
      'A two-headed upper-arm muscle responsible for elbow flexion and forearm supination.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'biceps',
    imageAltText: 'Anatomical illustration highlighting the biceps brachii',
    sortOrder: 1100,
  },
  {
    name: 'Brachialis',
    slug: 'brachialis',
    description:
      'A deep upper-arm muscle that acts as a primary elbow flexor regardless of forearm position.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'biceps',
    imageAltText: 'Anatomical illustration highlighting the brachialis',
    sortOrder: 1200,
  },
  {
    name: 'Brachioradialis',
    slug: 'brachioradialis',
    description:
      'A forearm muscle that contributes strongly to elbow flexion, particularly with a neutral grip.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'biceps',
    imageAltText: 'Anatomical illustration highlighting the brachioradialis',
    sortOrder: 1300,
  },

  {
    name: 'Triceps brachii',
    slug: 'triceps-brachii',
    description:
      'A three-headed upper-arm muscle responsible primarily for elbow extension.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'triceps',
    imageAltText: 'Anatomical illustration highlighting the triceps brachii',
    sortOrder: 1400,
  },

  {
    name: 'Forearm flexors',
    slug: 'forearm-flexors',
    description:
      'A group of forearm muscles involved in wrist and finger flexion and contributing to grip strength.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'forearms',
    imageAltText:
      'Anatomical illustration highlighting the forearm flexor muscles',
    sortOrder: 1500,
  },
  {
    name: 'Forearm extensors',
    slug: 'forearm-extensors',
    description:
      'A group of forearm muscles involved in wrist and finger extension and wrist stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'forearms',
    imageAltText:
      'Anatomical illustration highlighting the forearm extensor muscles',
    sortOrder: 1600,
  },

  {
    name: 'Rectus abdominis',
    slug: 'rectus-abdominis',
    description:
      'A superficial abdominal muscle responsible primarily for trunk flexion and control of the rib cage relative to the pelvis.',
    bodyRegion: BodyRegion.CORE,
    muscleGroupSlug: 'core',
    imageAltText: 'Anatomical illustration highlighting the rectus abdominis',
    sortOrder: 1700,
  },
  {
    name: 'External obliques',
    slug: 'external-obliques',
    description:
      'Superficial abdominal muscles involved in trunk rotation, lateral flexion, compression, and spinal stabilization.',
    bodyRegion: BodyRegion.CORE,
    muscleGroupSlug: 'core',
    imageAltText:
      'Anatomical illustration highlighting the external oblique muscles',
    sortOrder: 1800,
  },
  {
    name: 'Internal obliques',
    slug: 'internal-obliques',
    description:
      'Deep abdominal muscles involved in trunk rotation, lateral flexion, abdominal compression, and stabilization.',
    bodyRegion: BodyRegion.CORE,
    muscleGroupSlug: 'core',
    imageAltText:
      'Anatomical illustration highlighting the internal oblique muscles',
    sortOrder: 1900,
  },
  {
    name: 'Transverse abdominis',
    slug: 'transverse-abdominis',
    description:
      'The deepest abdominal muscle, contributing to abdominal compression and trunk and pelvic stabilization.',
    bodyRegion: BodyRegion.CORE,
    muscleGroupSlug: 'core',
    imageAltText:
      'Anatomical illustration highlighting the transverse abdominis',
    sortOrder: 2000,
  },

  {
    name: 'Gluteus maximus',
    slug: 'gluteus-maximus',
    description:
      'The largest gluteal muscle, responsible primarily for hip extension and external rotation.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'glutes',
    imageAltText: 'Anatomical illustration highlighting the gluteus maximus',
    sortOrder: 2100,
  },
  {
    name: 'Gluteus medius',
    slug: 'gluteus-medius',
    description:
      'A lateral hip muscle responsible for hip abduction and stabilization of the pelvis during single-leg movement.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'glutes',
    imageAltText: 'Anatomical illustration highlighting the gluteus medius',
    sortOrder: 2200,
  },
  {
    name: 'Gluteus minimus',
    slug: 'gluteus-minimus',
    description:
      'A deep lateral hip muscle that assists hip abduction, internal rotation, and pelvic stabilization.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'glutes',
    imageAltText: 'Anatomical illustration highlighting the gluteus minimus',
    sortOrder: 2300,
  },

  {
    name: 'Quadriceps',
    slug: 'quadriceps',
    description:
      'A four-muscle group on the front of the thigh responsible primarily for knee extension.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'quadriceps',
    imageAltText:
      'Anatomical illustration highlighting the quadriceps muscle group',
    sortOrder: 2400,
  },
  {
    name: 'Hamstrings',
    slug: 'hamstrings',
    description:
      'A posterior thigh muscle group involved in knee flexion, hip extension, and control of the pelvis.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'hamstrings',
    imageAltText:
      'Anatomical illustration highlighting the hamstring muscle group',
    sortOrder: 2500,
  },
  {
    name: 'Hip adductors',
    slug: 'hip-adductors',
    description:
      'A group of inner-thigh muscles responsible primarily for hip adduction and assisting hip stabilization.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'adductors',
    imageAltText:
      'Anatomical illustration highlighting the hip adductor muscles',
    sortOrder: 2600,
  },
  {
    name: 'Iliopsoas',
    slug: 'iliopsoas',
    description:
      'A deep hip-flexor muscle group composed of the iliacus and psoas major, responsible primarily for hip flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'hip-flexors',
    imageAltText: 'Anatomical illustration highlighting the iliopsoas',
    sortOrder: 2700,
  },

  {
    name: 'Gastrocnemius',
    slug: 'gastrocnemius',
    description:
      'The superficial calf muscle that contributes to ankle plantar flexion and knee flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'calves',
    imageAltText: 'Anatomical illustration highlighting the gastrocnemius',
    sortOrder: 2800,
  },
  {
    name: 'Soleus',
    slug: 'soleus',
    description:
      'A deep calf muscle responsible for ankle plantar flexion, especially when the knee is bent.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'calves',
    imageAltText: 'Anatomical illustration highlighting the soleus',
    sortOrder: 2900,
  },
  {
    name: 'Tibialis anterior',
    slug: 'tibialis-anterior',
    description:
      'A muscle on the front of the lower leg responsible primarily for ankle dorsiflexion and assisting foot inversion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'calves',
    imageAltText: 'Anatomical illustration highlighting the tibialis anterior',
    sortOrder: 3000,
  },

  {
    name: 'Sternocleidomastoid',
    slug: 'sternocleidomastoid',
    description:
      'A prominent neck muscle involved in cervical flexion, lateral flexion, and rotation of the head.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'neck',
    imageAltText:
      'Anatomical illustration highlighting the sternocleidomastoid',
    sortOrder: 3100,
  },
];

const childMuscles: MuscleSeed[] = [
  {
    name: 'Clavicular head of pectoralis major',
    slug: 'clavicular-head-pectoralis-major',
    description:
      'The upper portion of the pectoralis major, contributing strongly to shoulder flexion and horizontal adduction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'chest',
    parentSlug: 'pectoralis-major',
    imageAltText:
      'Anatomical illustration highlighting the clavicular head of the pectoralis major',
    sortOrder: 110,
  },
  {
    name: 'Sternocostal head of pectoralis major',
    slug: 'sternocostal-head-pectoralis-major',
    description:
      'The larger middle and lower portion of the pectoralis major, contributing to horizontal adduction and shoulder extension from a flexed position.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'chest',
    parentSlug: 'pectoralis-major',
    imageAltText:
      'Anatomical illustration highlighting the sternocostal head of the pectoralis major',
    sortOrder: 120,
  },

  {
    name: 'Upper trapezius',
    slug: 'upper-trapezius',
    description:
      'The upper portion of the trapezius, contributing to scapular elevation and upward rotation.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    parentSlug: 'trapezius',
    imageAltText: 'Anatomical illustration highlighting the upper trapezius',
    sortOrder: 510,
  },
  {
    name: 'Middle trapezius',
    slug: 'middle-trapezius',
    description:
      'The middle portion of the trapezius, responsible primarily for scapular retraction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    parentSlug: 'trapezius',
    imageAltText: 'Anatomical illustration highlighting the middle trapezius',
    sortOrder: 520,
  },
  {
    name: 'Lower trapezius',
    slug: 'lower-trapezius',
    description:
      'The lower portion of the trapezius, contributing to scapular depression, retraction, and upward rotation.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'back',
    parentSlug: 'trapezius',
    imageAltText: 'Anatomical illustration highlighting the lower trapezius',
    sortOrder: 530,
  },

  {
    name: 'Anterior deltoid',
    slug: 'anterior-deltoid',
    description:
      'The front portion of the deltoid, contributing primarily to shoulder flexion, internal rotation, and horizontal adduction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'deltoid',
    imageAltText: 'Anatomical illustration highlighting the anterior deltoid',
    sortOrder: 910,
  },
  {
    name: 'Lateral deltoid',
    slug: 'lateral-deltoid',
    description:
      'The middle portion of the deltoid, contributing primarily to shoulder abduction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'deltoid',
    imageAltText: 'Anatomical illustration highlighting the lateral deltoid',
    sortOrder: 920,
  },
  {
    name: 'Posterior deltoid',
    slug: 'posterior-deltoid',
    description:
      'The rear portion of the deltoid, contributing to shoulder extension, external rotation, and horizontal abduction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'deltoid',
    imageAltText: 'Anatomical illustration highlighting the posterior deltoid',
    sortOrder: 930,
  },

  {
    name: 'Supraspinatus',
    slug: 'supraspinatus',
    description:
      'A rotator-cuff muscle that assists shoulder abduction and stabilization of the humeral head.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'rotator-cuff',
    imageAltText: 'Anatomical illustration highlighting the supraspinatus',
    sortOrder: 1010,
  },
  {
    name: 'Infraspinatus',
    slug: 'infraspinatus',
    description:
      'A rotator-cuff muscle responsible primarily for external rotation and stabilization of the shoulder.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'rotator-cuff',
    imageAltText: 'Anatomical illustration highlighting the infraspinatus',
    sortOrder: 1020,
  },
  {
    name: 'Teres minor',
    slug: 'teres-minor',
    description:
      'A rotator-cuff muscle contributing to shoulder external rotation and joint stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'rotator-cuff',
    imageAltText: 'Anatomical illustration highlighting the teres minor',
    sortOrder: 1030,
  },
  {
    name: 'Subscapularis',
    slug: 'subscapularis',
    description:
      'A rotator-cuff muscle responsible primarily for internal rotation and stabilization of the shoulder.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'shoulders',
    parentSlug: 'rotator-cuff',
    imageAltText: 'Anatomical illustration highlighting the subscapularis',
    sortOrder: 1040,
  },

  {
    name: 'Long head of biceps brachii',
    slug: 'long-head-biceps-brachii',
    description:
      'The outer head of the biceps brachii, contributing to elbow flexion, forearm supination, and shoulder stabilization.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'biceps',
    parentSlug: 'biceps-brachii',
    imageAltText:
      'Anatomical illustration highlighting the long head of the biceps brachii',
    sortOrder: 1110,
  },
  {
    name: 'Short head of biceps brachii',
    slug: 'short-head-biceps-brachii',
    description:
      'The inner head of the biceps brachii, contributing to elbow flexion, forearm supination, and shoulder flexion.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'biceps',
    parentSlug: 'biceps-brachii',
    imageAltText:
      'Anatomical illustration highlighting the short head of the biceps brachii',
    sortOrder: 1120,
  },

  {
    name: 'Long head of triceps brachii',
    slug: 'long-head-triceps-brachii',
    description:
      'The largest triceps head, contributing to elbow extension as well as shoulder extension and adduction.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'triceps',
    parentSlug: 'triceps-brachii',
    imageAltText:
      'Anatomical illustration highlighting the long head of the triceps brachii',
    sortOrder: 1410,
  },
  {
    name: 'Lateral head of triceps brachii',
    slug: 'lateral-head-triceps-brachii',
    description:
      'The outer triceps head, contributing strongly to elbow extension, particularly under higher resistance.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'triceps',
    parentSlug: 'triceps-brachii',
    imageAltText:
      'Anatomical illustration highlighting the lateral head of the triceps brachii',
    sortOrder: 1420,
  },
  {
    name: 'Medial head of triceps brachii',
    slug: 'medial-head-triceps-brachii',
    description:
      'A deep triceps head that contributes to elbow extension across a wide range of resistance levels.',
    bodyRegion: BodyRegion.UPPER_BODY,
    muscleGroupSlug: 'triceps',
    parentSlug: 'triceps-brachii',
    imageAltText:
      'Anatomical illustration highlighting the medial head of the triceps brachii',
    sortOrder: 1430,
  },

  {
    name: 'Rectus femoris',
    slug: 'rectus-femoris',
    description:
      'A quadriceps muscle that extends the knee and also contributes to hip flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'quadriceps',
    parentSlug: 'quadriceps',
    imageAltText: 'Anatomical illustration highlighting the rectus femoris',
    sortOrder: 2410,
  },
  {
    name: 'Vastus lateralis',
    slug: 'vastus-lateralis',
    description:
      'The outer quadriceps muscle, responsible primarily for knee extension.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'quadriceps',
    parentSlug: 'quadriceps',
    imageAltText: 'Anatomical illustration highlighting the vastus lateralis',
    sortOrder: 2420,
  },
  {
    name: 'Vastus medialis',
    slug: 'vastus-medialis',
    description:
      'The inner quadriceps muscle, contributing to knee extension and stabilization of the patella.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'quadriceps',
    parentSlug: 'quadriceps',
    imageAltText: 'Anatomical illustration highlighting the vastus medialis',
    sortOrder: 2430,
  },
  {
    name: 'Vastus intermedius',
    slug: 'vastus-intermedius',
    description:
      'A deep quadriceps muscle located beneath the rectus femoris that contributes to knee extension.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'quadriceps',
    parentSlug: 'quadriceps',
    imageAltText: 'Anatomical illustration highlighting the vastus intermedius',
    sortOrder: 2440,
  },

  {
    name: 'Biceps femoris',
    slug: 'biceps-femoris',
    description:
      'A lateral hamstring muscle involved in knee flexion, hip extension, and external rotation of the lower leg.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'hamstrings',
    parentSlug: 'hamstrings',
    imageAltText: 'Anatomical illustration highlighting the biceps femoris',
    sortOrder: 2510,
  },
  {
    name: 'Semitendinosus',
    slug: 'semitendinosus',
    description:
      'A medial hamstring muscle involved in knee flexion, hip extension, and internal rotation of the lower leg.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'hamstrings',
    parentSlug: 'hamstrings',
    imageAltText: 'Anatomical illustration highlighting the semitendinosus',
    sortOrder: 2520,
  },
  {
    name: 'Semimembranosus',
    slug: 'semimembranosus',
    description:
      'A deep medial hamstring muscle involved in knee flexion, hip extension, and internal rotation of the lower leg.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'hamstrings',
    parentSlug: 'hamstrings',
    imageAltText: 'Anatomical illustration highlighting the semimembranosus',
    sortOrder: 2530,
  },

  {
    name: 'Adductor magnus',
    slug: 'adductor-magnus',
    description:
      'A large inner-thigh muscle contributing to hip adduction, extension, and stabilization.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'adductors',
    parentSlug: 'hip-adductors',
    imageAltText: 'Anatomical illustration highlighting the adductor magnus',
    sortOrder: 2610,
  },
  {
    name: 'Adductor longus',
    slug: 'adductor-longus',
    description:
      'An inner-thigh muscle contributing primarily to hip adduction and assisting hip flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'adductors',
    parentSlug: 'hip-adductors',
    imageAltText: 'Anatomical illustration highlighting the adductor longus',
    sortOrder: 2620,
  },
  {
    name: 'Adductor brevis',
    slug: 'adductor-brevis',
    description:
      'A deep inner-thigh muscle contributing to hip adduction and assisting hip flexion.',
    bodyRegion: BodyRegion.LOWER_BODY,
    muscleGroupSlug: 'adductors',
    parentSlug: 'hip-adductors',
    imageAltText: 'Anatomical illustration highlighting the adductor brevis',
    sortOrder: 2630,
  },
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function seedMuscleGroups(): Promise<Map<string, string>> {
  console.log(`Seeding ${muscleGroups.length} muscle groups...`);

  const groupIdsBySlug = new Map<string, string>();

  for (const muscleGroup of muscleGroups) {
    const savedGroup = await prisma.muscleGroup.upsert({
      where: {
        slug: muscleGroup.slug,
      },
      update: {
        name: muscleGroup.name,
        description: muscleGroup.description,
        sortOrder: muscleGroup.sortOrder,
      },
      create: {
        id: randomUUID(),
        ...muscleGroup,
      },
    });

    groupIdsBySlug.set(savedGroup.slug, savedGroup.id);
  }

  console.log('Muscle groups seeded successfully.');

  return groupIdsBySlug;
}

async function upsertMuscle(
  muscle: MuscleSeed,
  groupIdsBySlug: Map<string, string>,
  parentIdsBySlug: Map<string, string>,
): Promise<string> {
  const muscleGroupId = groupIdsBySlug.get(muscle.muscleGroupSlug);

  if (!muscleGroupId) {
    throw new Error(
      `Muscle group "${muscle.muscleGroupSlug}" was not found while seeding "${muscle.name}".`,
    );
  }

  let parentId: string | null = null;

  if (muscle.parentSlug) {
    parentId = parentIdsBySlug.get(muscle.parentSlug) ?? null;

    if (!parentId) {
      throw new Error(
        `Parent muscle "${muscle.parentSlug}" was not found while seeding "${muscle.name}".`,
      );
    }
  }

  const savedMuscle = await prisma.muscle.upsert({
    where: {
      slug: muscle.slug,
    },
    update: {
      name: muscle.name,
      description: muscle.description,
      bodyRegion: muscle.bodyRegion,
      muscleGroupId,
      parentId,
      imageAltText: muscle.imageAltText,
      isActive: true,
      sortOrder: muscle.sortOrder,
    },
    create: {
      id: randomUUID(),
      name: muscle.name,
      slug: muscle.slug,
      description: muscle.description,
      bodyRegion: muscle.bodyRegion,
      muscleGroupId,
      parentId,
      thumbnailUrl: null,
      thumbnailStorageKey: null,
      imageAltText: muscle.imageAltText,
      isActive: true,
      sortOrder: muscle.sortOrder,
    },
  });

  return savedMuscle.id;
}

async function seedMuscles(groupIdsBySlug: Map<string, string>): Promise<void> {
  console.log(
    `Seeding ${parentMuscles.length + childMuscles.length} muscles...`,
  );

  const parentIdsBySlug = new Map<string, string>();

  for (const muscle of parentMuscles) {
    const muscleId = await upsertMuscle(
      muscle,
      groupIdsBySlug,
      parentIdsBySlug,
    );

    parentIdsBySlug.set(muscle.slug, muscleId);
  }

  for (const muscle of childMuscles) {
    const muscleId = await upsertMuscle(
      muscle,
      groupIdsBySlug,
      parentIdsBySlug,
    );

    parentIdsBySlug.set(muscle.slug, muscleId);
  }

  console.log('Muscles seeded successfully.');
}

async function main(): Promise<void> {
  console.log('Starting database seed...');

  const groupIdsBySlug = await seedMuscleGroups();

  await seedMuscles(groupIdsBySlug);

  console.log('Database seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
