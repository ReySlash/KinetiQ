export abstract class ValueObject<T> {
  protected constructor(protected readonly rawValue: T) {}

  get value(): T {
    return this.rawValue;
  }

  equals(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}
