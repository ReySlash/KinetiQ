const MAX_NAME_LENGTH = 120;

export class TrainingProgramName {
  private constructor(private readonly name: string) {}

  static create(value: string): TrainingProgramName {
    const normalized = value.trim();
    if (normalized.length < 2 || normalized.length > MAX_NAME_LENGTH) {
      throw new Error(
        `Training program name must contain between 2 and ${MAX_NAME_LENGTH} characters.`,
      );
    }

    return new TrainingProgramName(normalized);
  }

  get value(): string {
    return this.name;
  }
}
