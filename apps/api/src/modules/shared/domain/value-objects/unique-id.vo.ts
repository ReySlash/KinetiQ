export class UniqueId {
  private readonly _value: string;

  constructor(id?: string) {
    this._value = id ?? crypto.randomUUID();
  }

  get value(): string {
    return this._value;
  }

  equals(other: UniqueId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
