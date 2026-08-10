const MAX_DESCRIPTION_LENGTH = 2000;

export class TrainingProgramDescription {
  private constructor(private readonly description: string | null) {}

  static create(value: string | null | undefined): TrainingProgramDescription {
    const normalized = value?.trim() || null;
    if (normalized && normalized.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Training program description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
      );
    }

    return new TrainingProgramDescription(normalized);
  }

  get value(): string | null {
    return this.description;
  }
}
