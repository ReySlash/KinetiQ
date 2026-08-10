import { randomUUID } from 'node:crypto';

export class TrainingProgramId {
  private constructor(private readonly id: string) {}

  static create(): TrainingProgramId {
    return new TrainingProgramId(randomUUID());
  }

  get value(): string {
    return this.id;
  }
}
