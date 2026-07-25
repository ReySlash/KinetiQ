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

export const chestExercises: ExerciseSeed[] = [
  {
    name: 'Barbell Bench Press',
    slug: 'barbell-bench-press',
    description:
      'A compound horizontal pressing exercise performed while lying on a bench and pressing a barbell away from the chest.',
    instructions:
      'Lie on the bench with your eyes under the bar. Plant your feet firmly, retract and depress the shoulder blades, and grip the bar slightly wider than shoulder width. Unrack the bar, lower it under control toward the lower chest, and press it upward until the elbows are extended without losing upper-back tension.',
    commonMistakes:
      'Allowing the shoulders to roll forward, excessively flaring the elbows, bouncing the bar from the chest, lifting the hips from the bench, or losing wrist alignment.',
    movementPatternSlug: 'horizontal-push',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.OPEN,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.SUPINE,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing a barbell bench press on a flat bench',
    equipmentSlugs: ['barbell', 'bench'],
    muscles: [
      {
        muscleSlug: 'pectoralis-major',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
        notes: 'Primary producer of shoulder horizontal adduction.',
      },
      {
        muscleSlug: 'triceps-brachii',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
        notes: 'Extends the elbow during the pressing phase.',
      },
      {
        muscleSlug: 'anterior-deltoid',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
        notes: 'Assists shoulder flexion and horizontal adduction.',
      },
      {
        muscleSlug: 'serratus-anterior',
        role: MuscleRole.STABILIZER,
        involvementScore: 2,
        notes: 'Contributes to scapular control against the bench.',
      },
      {
        muscleSlug: 'rotator-cuff',
        role: MuscleRole.STABILIZER,
        involvementScore: 2,
        notes: 'Stabilizes the humeral head throughout the press.',
      },
    ],
    capabilities: {
      hypertrophyPotential: 5,
      maximalStrengthPotential: 5,
      powerDevelopmentPotential: 4,
      muscularEndurancePotential: 3,
      stabilityDevelopmentPotential: 2,
      typicalLoadability: 5,
      stretchPositionLoading: 4,
      shortenedPositionLoading: 3,
      editorialNotes:
        'A highly loadable compound exercise for chest, triceps, and anterior-deltoid development.',
    },
    demands: {
      technicalDemand: 3,
      setupComplexity: 3,
      stabilityDemand: 3,
      systemicFatiguePotential: 3,
      localFatiguePotential: 4,
      recoveryCostPotential: 3,
      gripDemand: 2,
      axialLoadingPotential: 0,
      editorialNotes:
        'Moderate technical demand with relatively low axial loading.',
    },
  },
  {
    name: 'Incline Dumbbell Bench Press',
    slug: 'incline-dumbbell-bench-press',
    description:
      'A compound incline press emphasizing the clavicular portion of the pectoralis major while requiring independent arm control.',
    instructions:
      'Set the bench to a low or moderate incline. Hold the dumbbells beside the upper chest with the wrists stacked over the elbows. Keep the shoulder blades controlled against the bench, press the dumbbells upward and slightly inward, and lower them under control until a comfortable chest stretch is reached.',
    commonMistakes:
      'Using an excessively steep incline, shrugging the shoulders, allowing the elbows to drift too far behind the torso, colliding the dumbbells at the top, or shortening the range of motion.',
    movementPatternSlug: 'horizontal-push',
    forceType: ForceType.PUSH,
    kineticChain: KineticChain.OPEN,
    isCompound: true,
    laterality: Laterality.BILATERAL,
    contractionMode: ContractionMode.DYNAMIC,
    bodyPosition: BodyPosition.SUPINE,
    skillLevel: SkillLevel.INTERMEDIATE,
    imageAltText: 'Athlete performing an incline dumbbell bench press',
    equipmentSlugs: ['dumbbells', 'bench'],
    muscles: [
      {
        muscleSlug: 'clavicular-head-pectoralis-major',
        role: MuscleRole.PRIMARY,
        involvementScore: 5,
      },
      {
        muscleSlug: 'anterior-deltoid',
        role: MuscleRole.SECONDARY,
        involvementScore: 4,
      },
      {
        muscleSlug: 'triceps-brachii',
        role: MuscleRole.SECONDARY,
        involvementScore: 3,
      },
      {
        muscleSlug: 'rotator-cuff',
        role: MuscleRole.STABILIZER,
        involvementScore: 3,
      },
    ],
    capabilities: {
      hypertrophyPotential: 5,
      maximalStrengthPotential: 3,
      powerDevelopmentPotential: 2,
      muscularEndurancePotential: 3,
      stabilityDevelopmentPotential: 3,
      typicalLoadability: 4,
      stretchPositionLoading: 5,
      shortenedPositionLoading: 3,
      editorialNotes:
        'Provides substantial upper-chest stimulus and a large loaded stretch.',
    },
    demands: {
      technicalDemand: 3,
      setupComplexity: 3,
      stabilityDemand: 4,
      systemicFatiguePotential: 2,
      localFatiguePotential: 4,
      recoveryCostPotential: 3,
      gripDemand: 2,
      axialLoadingPotential: 0,
    },
  },
  createExercise({
    name: 'Incline Barbell Bench Press',
    slug: 'incline-barbell-bench-press',
    description:
      'A barbell press performed on an inclined bench to emphasize the clavicular pectoralis while developing pressing strength.',
    instructions:
      'Set a low-to-moderate incline, plant the feet, retract the shoulder blades, and unrack the bar over the upper chest. Lower with stacked wrists and controlled elbows, press upward over the shoulders, and keep the torso braced throughout.',
    commonMistakes:
      'Setting the bench too steep, flaring the elbows, bouncing the bar, losing foot pressure, or allowing the shoulders to roll forward.',
    imageAltText: 'Athlete performing an incline barbell bench press',
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
    equipmentSlugs: ['barbell', 'adjustable-bench', 'squat-rack'],
    muscles: [
      ['clavicular-head-pectoralis-major', MuscleRole.PRIMARY, 5],
      ['anterior-deltoid', MuscleRole.SECONDARY, 4],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 3, 3, 2, 5, 4, 3],
    demandScores: [3, 4, 3, 3, 4, 3, 2, 0],
  }),
  createExercise({
    name: 'Decline Barbell Bench Press',
    slug: 'decline-barbell-bench-press',
    description:
      'A barbell press on a declined bench that loads the sternocostal pectoralis through a stable horizontal pressing pattern.',
    instructions:
      'Secure the legs on the decline bench, retract the shoulder blades, and unrack the bar over the lower chest. Lower under control with the forearms vertical, press to elbow extension, and maintain upper-back contact with the pad.',
    commonMistakes:
      'Using an unsafe bench setup, lowering toward the neck, bouncing the bar, over-flaring the elbows, or losing scapular position.',
    imageAltText: 'Athlete performing a decline barbell bench press',
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
    equipmentSlugs: ['barbell', 'adjustable-bench', 'squat-rack'],
    muscles: [
      ['sternocostal-head-pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 2],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 4, 3, 3, 2, 5, 4, 3],
    demandScores: [3, 4, 3, 3, 4, 3, 2, 0],
  }),
  createExercise({
    name: 'Dumbbell Bench Press',
    slug: 'dumbbell-bench-press',
    description:
      'A flat dumbbell press that trains the chest and elbow extensors while allowing each arm to move independently.',
    instructions:
      'Sit with the dumbbells on the thighs, lie back, and position them beside the chest with feet planted. Press upward while keeping wrists over elbows, then lower both weights under control to a comfortable chest stretch.',
    commonMistakes:
      'Colliding the dumbbells, letting the elbows drift too far below the torso, arching excessively, losing wrist alignment, or using uneven ranges of motion.',
    imageAltText: 'Athlete performing a flat dumbbell bench press',
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
    equipmentSlugs: ['dumbbells', 'bench'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 3, 2, 3, 3, 4, 5, 3],
    demandScores: [3, 3, 4, 2, 4, 3, 2, 0],
  }),
  createExercise({
    name: 'Dumbbell Floor Press',
    slug: 'dumbbell-floor-press',
    description:
      'A dumbbell press performed from the floor that limits shoulder extension and emphasizes controlled chest and triceps strength.',
    instructions:
      'Lie supine with knees bent and hold the dumbbells above the elbows. Brace the trunk, press until the arms are straight, then lower slowly until the upper arms make gentle contact with the floor before reversing.',
    commonMistakes:
      'Slamming the elbows into the floor, losing wrist alignment, allowing the shoulders to roll forward, using hip drive, or shortening the lockout.',
    imageAltText: 'Athlete performing a dumbbell floor press',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SUPINE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['dumbbells'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 4],
      ['triceps-brachii', MuscleRole.PRIMARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 3, 2, 3, 3, 4, 2, 3],
    demandScores: [2, 2, 3, 2, 4, 2, 2, 0],
  }),
  createExercise({
    name: 'Machine Chest Press',
    slug: 'machine-chest-press',
    description:
      'A guided horizontal press that provides stable chest loading and straightforward progression with limited balance demand.',
    instructions:
      'Adjust the seat so the handles align with mid-chest, place the feet firmly, and keep the shoulder blades controlled against the pad. Press to near elbow extension and return slowly until a comfortable chest stretch is reached.',
    commonMistakes:
      'Setting the seat incorrectly, shrugging, locking the elbows aggressively, allowing the shoulders to round, or letting the weight stack crash.',
    imageAltText: 'Athlete using a seated chest press machine',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.SITTING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['chest-press-machine'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 3, 2, 4, 1, 4, 4, 4],
    demandScores: [1, 1, 1, 1, 5, 2, 1, 0],
  }),
  createExercise({
    name: 'Cable Chest Press',
    slug: 'cable-chest-press',
    description:
      'A standing cable press that trains horizontal pressing while requiring the trunk and shoulder girdle to resist cable pull.',
    instructions:
      'Set the handles near chest height, take a split stance, and brace with the elbows slightly behind the torso. Press forward without rotating, reach to a controlled finish, and return the handles slowly while keeping the rib cage stacked.',
    commonMistakes:
      'Overarching the lower back, rotating the torso, shrugging, allowing the elbows to flare excessively, or stepping too far from the machine.',
    imageAltText: 'Athlete performing a standing cable chest press',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.OPEN,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.STANDING,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['cable-machine'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 3],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['external-obliques', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [4, 2, 2, 4, 4, 3, 4, 5],
    demandScores: [2, 2, 4, 2, 4, 2, 1, 0],
  }),
  createExercise({
    name: 'Push-up',
    slug: 'push-up',
    description:
      'A closed-chain bodyweight press that develops the chest, triceps, shoulder girdle, and trunk control.',
    instructions:
      'Place the hands slightly wider than shoulder width and form a straight line from head to heels. Brace the trunk, lower the chest between the hands with controlled elbows, press the floor away, and finish with stable shoulder blades.',
    commonMistakes:
      'Sagging the hips, flaring the elbows, leading with the head, shortening depth, or losing scapular control at the top.',
    imageAltText: 'Athlete performing a standard push-up',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.PRONE,
      SkillLevel.BEGINNER,
    ],
    equipmentSlugs: ['bodyweight'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [4, 2, 3, 5, 4, 2, 4, 4],
    demandScores: [2, 0, 4, 2, 4, 2, 0, 0],
  }),
  createExercise({
    name: 'Weighted Push-up',
    slug: 'weighted-push-up',
    description:
      'A loaded push-up variation that preserves closed-chain pressing mechanics while increasing chest and triceps resistance.',
    instructions:
      'Secure a weight plate across the upper back with assistance, establish a rigid plank, and place the hands under or slightly outside the shoulders. Lower under control, press to full support, and keep the plate and pelvis stable.',
    commonMistakes:
      'Placing the plate on the lower back, allowing it to slide, sagging through the trunk, flaring the elbows, or reducing range as load increases.',
    imageAltText: 'Athlete performing a push-up with a weight plate',
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
    equipmentSlugs: ['bodyweight', 'weight-plates'],
    muscles: [
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.SECONDARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.SECONDARY, 3],
      ['transverse-abdominis', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 4, 3, 4, 4, 4, 4, 4],
    demandScores: [3, 3, 4, 3, 5, 3, 0, 1],
  }),
  createExercise({
    name: 'Parallel Bar Dip',
    slug: 'parallel-bar-dip',
    description:
      'A bodyweight compound press on parallel bars that loads the lower chest, triceps, and anterior shoulder through a deep closed-chain range.',
    instructions:
      'Support the body on locked arms, brace the trunk, and lean slightly forward. Bend the elbows to lower until the shoulders reach a comfortable depth, then drive through the bars and return to a stable support.',
    commonMistakes:
      'Dropping into excessive depth, shrugging, flaring the elbows, swinging the legs, or losing shoulder control near the bottom.',
    imageAltText: 'Athlete performing a dip on parallel bars',
    classification: [
      'horizontal-push',
      ForceType.PUSH,
      KineticChain.CLOSED,
      true,
      Laterality.BILATERAL,
      ContractionMode.DYNAMIC,
      BodyPosition.OTHER,
      SkillLevel.INTERMEDIATE,
    ],
    equipmentSlugs: ['bodyweight', 'parallel-bars'],
    muscles: [
      ['sternocostal-head-pectoralis-major', MuscleRole.PRIMARY, 5],
      ['triceps-brachii', MuscleRole.PRIMARY, 4],
      ['anterior-deltoid', MuscleRole.SECONDARY, 3],
      ['serratus-anterior', MuscleRole.STABILIZER, 2],
      ['rotator-cuff', MuscleRole.STABILIZER, 3],
    ],
    capabilityScores: [5, 4, 3, 4, 4, 4, 5, 3],
    demandScores: [3, 1, 4, 3, 5, 3, 2, 0],
  }),
  createExercise({
    name: 'Cable Chest Fly',
    slug: 'cable-chest-fly',
    description:
      'A cable isolation exercise that trains shoulder horizontal adduction with continuous tension through the chest’s range of motion.',
    instructions:
      'Set the pulleys around chest height, take a stable split stance, and hold the arms open with soft elbows. Sweep the hands together in an arc without changing elbow angle, pause briefly, and return under control to a comfortable stretch.',
    commonMistakes:
      'Turning the movement into a press, overstretching the shoulders, shrugging, arching the back, or allowing the cables to pull the arms back abruptly.',
    imageAltText: 'Athlete performing a standing cable chest fly',
    classification: [
      'horizontal-push',
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
      ['pectoralis-major', MuscleRole.PRIMARY, 5],
      ['anterior-deltoid', MuscleRole.SECONDARY, 2],
      ['rotator-cuff', MuscleRole.STABILIZER, 2],
    ],
    capabilityScores: [5, 1, 1, 4, 2, 3, 5, 5],
    demandScores: [2, 2, 3, 1, 5, 2, 1, 0],
  }),
];
