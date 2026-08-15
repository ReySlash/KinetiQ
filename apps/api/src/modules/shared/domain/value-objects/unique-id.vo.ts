import { randomUUID } from 'node:crypto';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UniqueId {
  private constructor(private readonly _value: string) {}

  static create(value?: string): UniqueId {
    const id = value ?? randomUUID();
    if (!UUID_PATTERN.test(id)) {
      throw new Error('Unique ID must be a valid UUID.');
    }
    return new UniqueId(id);
  }

  get value(): string {
    return this._value;
  }

  equals(other: UniqueId): boolean {
    return this._value === other._value;
  }
}
