import { randomUUID } from 'node:crypto';

import { ValueObject } from './value-object.vo';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UniqueId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): UniqueId {
    const id = value ?? randomUUID();
    if (!UUID_PATTERN.test(id)) {
      throw new Error('Unique ID must be a valid UUID.');
    }
    return new UniqueId(id);
  }
}
