import { AdoptedTrainingProgram } from '../../domain/adopted-training-program.aggregate';
import type { CreateProgramWorkoutOccurrenceAttributes } from '../../domain/program-workout-occurrence.types';
import { ExistingUuid } from '../../../shared/domain/value-objects/existing-uuid.vo';
import {
  AdoptedTrainingProgramEmptyScheduleError,
  AdoptedTrainingProgramSourceNotFoundError,
} from '../errors/adopted-training-program.errors';
import type {
  AdoptTrainingProgramInput,
  AdoptTrainingProgramResult,
} from '../models/adopted-training-program-command.input';
import type { AdoptedTrainingProgramsCommandPort } from '../ports/adopted-training-programs-command.port';
import type { AdoptedTrainingProgramSource } from '../models/adopted-training-program-source.model';
import type { AdoptedTrainingProgramSourcesPort } from '../ports/adopted-training-program-sources.port';

export class AdoptTrainingProgramUseCase {
  constructor(
    private readonly commands: AdoptedTrainingProgramsCommandPort,
    private readonly sources: AdoptedTrainingProgramSourcesPort,
  ) {}

  async execute(
    input: AdoptTrainingProgramInput,
  ): Promise<AdoptTrainingProgramResult> {
    const ownerId = ExistingUuid.create(input.ownerId).value;
    const source = await this.sources.findAccessibleBySlug(
      input.sourceProgramSlug,
      ownerId,
    );
    if (!source) {
      throw new AdoptedTrainingProgramSourceNotFoundError();
    }
    if (source.schedule.length === 0) {
      throw new AdoptedTrainingProgramEmptyScheduleError();
    }

    const program = AdoptedTrainingProgram.create({
      ownerId,
      sourceTrainingProgramId: source.id,
      programNameSnapshot: source.name,
      durationWeeksSnapshot: source.durationWeeks,
      startedAt: new Date(),
      occurrences: source.schedule.map(toOccurrenceAttributes),
    });
    await this.commands.create(program);
    return {
      id: program.id.value,
      status: 'ACTIVE',
      startedAt: program.startedAt,
    };
  }
}

function toOccurrenceAttributes(
  scheduleItem: AdoptedTrainingProgramSource['schedule'][number],
): CreateProgramWorkoutOccurrenceAttributes {
  return {
    sourceTrainingProgramRoutineId: scheduleItem.id,
    sourceRoutineId: scheduleItem.routineId,
    weekNumber: scheduleItem.weekNumber,
    dayNumber: scheduleItem.dayNumber,
    routineNameSnapshot: scheduleItem.routineName,
    programSlotNotesSnapshot: scheduleItem.notes,
  };
}
